/*
    Copyright 2026 David Healey

    This file is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This file is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with This file. If not, see <http://www.gnu.org/licenses/>.
*/

/*
    Velocity Dynamics Modulator
    ---------------------------
    A "Script Time Variant Modulator" that reproduces the basics of the
    built-in Midi Controller modulator (smoothing, value, table) but is
    driven by note velocity in addition to MIDI CC:

    - Notes with velocity BELOW Value cause the output to head towards
      about half of that velocity, then ease back up at the Smooth Up
      rate once it arrives. Softer notes start lower than
      harder-but-still-below-Value notes.
    - Notes with velocity ABOVE Value cause the output to head towards
      a point above Value, then ease back down at the Smooth Down rate
      once it arrives.
    - The move towards that snap target is itself eased over the Attack
      time rather than jumping instantly, so rapid retriggering (two
      notes close together) doesn't produce a hard step in the output
      and the resulting click/zipper noise.
    - Smooth Up and Smooth Down are independent knobs, since the two
      cases usually want a different feel (e.g. a slower rise out of a
      soft attack than the fall-off after a hard hit). Whichever one
      applies each sample is chosen by comparing the current output to
      Value, not by which branch triggered the snap.
    - If Use Table is on, the Table shapes the final output value every
      sample (x-axis = normalized output 0-1, y-axis = shaped output
      0-1), the same way the built-in Midi Controller modulator shapes
      its CC value. Since it runs on every processBlock sample, it
      reshapes the whole envelope (attack and release alike), not just
      the snap target.

    This gives soft-velocity notes a gentle attack and hard-velocity notes
    a pronounced attack, using the modulator's own audio-rate smoothing
    instead of a script timer.

    The snap only fires on non-legato notes (i.e. when no other key is
    already held), so legato/tied phrases pass through unaffected.

    Usage:
    1. Add a "Script Time Variant Modulator" to a sound generator's
       modulation chain (e.g. via Synth.addModulator or the modulator
       browser) and open its script editor.
    2. Paste this file into the onInit tab (it fills in all callbacks).
    3. Wire the modulator into whatever chain needs the dynamics response
       (e.g. the gain modulation chain).
*/

Content.setHeight(200);

reg attackMs = 10.0;
reg smoothUpMs = 200.0;
reg smoothDownMs = 200.0;
reg value = 64.0;              // 0-127, resting target and velocity threshold
reg currentValue = 64.0;       // current smoothed output (0-127)
reg snapTarget = 64.0;         // where onNoteOn wants currentValue to head towards
reg isAttacking = false;       // true while easing towards snapTarget
reg smootherXAttack = 0.0;     // one-pole coefficient used while easing towards snapTarget
reg smootherXUp = 0.0;         // one-pole coefficient used while ramping up towards Value
reg smootherXDown = 0.0;       // one-pole coefficient used while ramping down towards Value
reg controlSampleRate = 44100.0;

//! knbAttack
const knbAttack = Content.addKnob("Attack", 10, 0);
knbAttack.set("text", "Attack");
knbAttack.setRange(0, 500, 1);
knbAttack.set("defaultValue", 10);
knbAttack.set("suffix", " ms");
knbAttack.setControlCallback(onAttackControl);

inline function onAttackControl(component, newValue)
{
    attackMs = newValue;
    updateSmootherCoefficients();
}

//! knbSmoothUp
const knbSmoothUp = Content.addKnob("SmoothUp", 160, 0);
knbSmoothUp.set("text", "Smooth Up");
knbSmoothUp.setRange(0, 2000, 1);
knbSmoothUp.set("defaultValue", 200);
knbSmoothUp.set("suffix", " ms");
knbSmoothUp.setControlCallback(onSmoothUpControl);

inline function onSmoothUpControl(component, newValue)
{
    smoothUpMs = newValue;
    updateSmootherCoefficients();
}

//! knbSmoothDown
const knbSmoothDown = Content.addKnob("SmoothDown", 310, 0);
knbSmoothDown.set("text", "Smooth Down");
knbSmoothDown.setRange(0, 2000, 1);
knbSmoothDown.set("defaultValue", 200);
knbSmoothDown.set("suffix", " ms");
knbSmoothDown.setControlCallback(onSmoothDownControl);

inline function onSmoothDownControl(component, newValue)
{
    smoothDownMs = newValue;
    updateSmootherCoefficients();
}

//! knbSmoothValue
const knbValue = Content.addKnob("Value", 460, 0);
knbValue.set("text", "Value");
knbValue.setRange(0, 127, 1);
knbValue.set("defaultValue", 64);
knbValue.setControlCallback(onValueControl);

inline function onValueControl(component, newValue)
{
    value = newValue;
}

//! tblResponse
const tblResponse = Content.addTable("ResponseTable", 0, 75);
tblResponse.set("text", "Response Table");
tblResponse.set("width", 430);
tblResponse.set("height", 100);

//! Functions

// controlSampleRate is the audio sample rate divided by HISE's control-rate
// downsampling factor, since processBlock runs at that reduced rate rather
// than the full audio rate. It converts the Smoothing knobs (ms) into the
// correct one-pole coefficients for however many control-rate ticks those
// times span.
inline function updateSmootherCoefficients()
{
    smootherXAttack = timeToCoefficient(attackMs);
    smootherXUp = timeToCoefficient(smoothUpMs);
    smootherXDown = timeToCoefficient(smoothDownMs);
}

inline function: number timeToCoefficient(timeMs)
{
    if (timeMs <= 0.0)
        return 0.0;

    local freq = 1000.0 / timeMs;
    return Math.exp(-2.0 * Math.PI * freq / controlSampleRate);
}

//! Callbacks
function prepareToPlay(sampleRate, samplesPerBlock)
{
    controlSampleRate = sampleRate / Engine.getControlRateDownsamplingFactor();
    updateSmootherCoefficients();
}

function processBlock(buffer)
{
    local numSamples = buffer.length;

    for (i = 0; i < numSamples; i++)
    {
        if (isAttacking)
        {
            currentValue = snapTarget + (currentValue - snapTarget) * smootherXAttack;

            // Close enough (or Attack is 0, i.e. smootherXAttack is 0 and
            // this lands exactly on it in one tick) -- hand off to the
            // Smooth Up/Down release stage.
            if (Math.abs(currentValue - snapTarget) < 0.05)
            {
                currentValue = snapTarget;
                isAttacking = false;
            }
        }
        else
        {
            local x = (currentValue < value) ? smootherXUp : smootherXDown;
            currentValue = value + (currentValue - value) * x;
        }

        local normalized = currentValue / 127.0;

        normalized = tblResponse.getTableValue(normalized);

        buffer[i] = normalized;
    }
}

function onNoteOn()
{
    // Synth.isLegatoInterval() is true whenever more than one key is
    // currently held, so this skips the snap for legato/tied notes and
    // only fires on a fresh, non-legato attack.
    if (Synth.isLegatoInterval())
        return;

    local velocity = Message.getVelocity();

    if (velocity < value)
    {
        // value * (velocity / value) * 0.5 simplifies to velocity * 0.5,
        // which also sidesteps a division by value (safe here anyway
        // since this branch is unreachable when value is 0).
        snapTarget = velocity * 0.5;
        isAttacking = true;
    }
    else if (velocity > value)
    {
        snapTarget = Math.min(127.0, value + velocity * 0.5);
        isAttacking = true;
    }
}

function onNoteOff()
{

}

function onController()
{

}

function onControl(number, value)
{

}
