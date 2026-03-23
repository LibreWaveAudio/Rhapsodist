/**
 * Title: FX_MultiChannelGain.js
 * Author: David Healey
 * License: Public Domain
*
* This not a regular script. It's a script effect
*/

const core = Libraries.load("core");
const gainers = [core.createModule("smoothed_gainer"), core.createModule("smoothed_gainer")];
const stereo = core.createModule("stereo");

//! knbGain
const knbGain = Content.addKnob("Gain", 10, 0);
knbGain.set("text", "Gain");
knbGain.set("mode", "Decibel");
knbGain.setRange(-100, 12, 0.1);
knbGain.set("middlePosition", -18);
knbGain.set("defaultValue", -3);
knbGain.setControlCallback(onknbGainControl);

inline function onknbGainControl(component, value)
{
	updateGainers();
}

//! knbSmooth
const knbSmooth = Content.addKnob("Smoothing", 160, 0);
knbSmooth.setRange(0, 1000, 0.1);
knbSmooth.set("defaultValue", "250");
knbSmooth.set("mode", "Time");
knbSmooth.setControlCallback(onknbSmoothControl);

inline function onknbSmoothControl(component, value)
{
	for (x in gainers)
		x.setParameter(x.SmoothingTime, value);
}

//! knbWidth
const knbWidth = Content.addKnob("Width", 310, 0);
knbWidth.set("text", "Width");
knbWidth.setRange(0, 200, 0.01);
knbWidth.set("middlePosition", 100);
knbWidth.set("defaultValue", 100);
knbWidth.setControlCallback(onknbWidthControl);

inline function onknbWidthControl(component, value)
{
	stereo.setParameter(stereo.Width, value);	
}

//! knbBalance
const knbBalance = Content.addKnob("Balance", 460, 0);
knbBalance.set("text", "Balance");
knbBalance.set("mode", "Pan");
knbBalance.setControlCallback(onknbBalanceControl);

inline function onknbBalanceControl(component, value)
{
	updateGainers();
}

//! Functions
inline function updateGainers()
{
	local gainValue = knbGain.getValue();
	local normalizedBalance = knbBalance.getValue() / 100;
	local panValues = [];

	panValues[0] = Math.cos((Math.PI / 4) * (1 + normalizedBalance)); // Left
	panValues[1] = Math.sin((Math.PI / 4) * (1 + normalizedBalance)); // Right
		
	for (i = 0; i < gainers.length; i++)
	{
		local v = Engine.getGainFactorForDecibels(gainValue) * panValues[i];
		gainers[i].setParameter(gainers[i].Gain, v);
	}
}
function prepareToPlay(sampleRate, blockSize)
{
    gainers[0].prepareToPlay(sampleRate, blockSize);
    gainers[1].prepareToPlay(sampleRate, blockSize);
    stereo.prepareToPlay(sampleRate, blockSize);
}
function processBlock(channels)
{
	for (i = 0; i < channels.length; i++)
	{
		gainers[i % 2] >> channels[i];
		stereo >> channels[i];
	}
}
function onControl(number, value)
{
	
}
 