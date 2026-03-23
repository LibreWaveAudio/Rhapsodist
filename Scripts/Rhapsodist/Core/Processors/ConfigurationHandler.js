/*
    Copyright 2021, 2022, 2023, 2024, 2025, 2026 David Healey

    This file is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License  as published by
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
* This module is responsible for configuring all modules
* when loading the project, changing patch, and changing articulation
*/

include("App/Manifest.js");
include("Rhapsodist/Core/Includes/ArticulationDataManager.js");

const useUacc = isDefined(Manifest.useUacc) ? Manifest.useUacc : true;

//! Scripts
const scriptIds = Synth.getIdList("Script Processor");
scriptIds.concat(Synth.getIdList("Legato with Retrigger"));
scriptIds.concat(Synth.getIdList("Arpeggiator"));
scriptIds.concat(Synth.getIdList("CC Swapper"));
scriptIds.concat(Synth.getIdList("Release Trigger"));
scriptIds.remove("Interface");

const scripts = getModules(scriptIds, "script");
const scriptAttributeIds = getAttributeIds(scripts);

//! Muters
const muterIds = Synth.getIdList("MidiMuter");
muterIds.remove("masterMidiMuter");

const muters = getModules(muterIds, "muter");

for (x in muters)
	x.setBypassed(false);

//! Modulators
const modulatorIds = getModulatorIds();
const modulators = getModules(modulatorIds, "modulator");
const modulatorAttributeIds = getAttributeIds(modulators);

//! Effects
const effectIds = getEffectIds();
const effects = getModules(effectIds, "effect");
const effectAttributeIds = getAttributeIds(effects);

//! Samplers
const samplerIds = Synth.getIdList("Sampler");
const samplers = getModules(samplerIds, "sampler");
const samplerTables = getModules(samplerIds, "samplerTable");
const samplerAttributeIds = getAttributeIds(samplers);

for (x in samplers)
	x.asSampler().enableRoundRobin(false);
	
//! knbPatch
const knbPatch = Content.addKnob("Patch", 10, 0);
knbPatch.setRange(-1, 100, 1);
knbPatch.setControlCallback(onknbPatchControl);

inline function onknbPatchControl(component, value)
{
	changePatch(value);
}

//! knbArticulation
const knbArticulation = Content.addKnob("Articulation", 160, 0);
knbArticulation.setRange(-1, 100, 1);
knbArticulation.setControlCallback(onknbArticulationControl);

inline function onknbArticulationControl(component, value)
{
	changeArticulation(value);
}

//! Functions
inline function changePatch(index: number)
{
	if (index == -1)
		return;

	local patch = Manifest.patches[index];

	if (!isDefined(patch))
		return;

	resetKeyColours();
	loadManifestConfiguration();
	setKeyRanges(patch.keyranges);
	setAttributes(scripts, scriptIds, scriptAttributeIds, patch.scripts);
	setAttributes(modulators, modulatorIds, modulatorAttributeIds, patch.modulators);
	setAttributes(effects, effectIds, effectAttributeIds, patch.effects);
	setAttributes(samplers, samplerIds, samplerAttributeIds, patch.samplers);
	enableMuters(isDefined(patch.muters) ? patch.muters : []);
	
	local samplerData;

	if (isDefined(patch.samplers))
		samplerData = patch.samplers;
	else if (isDefined(Manifest.samplers))
		samplerData = Manifest.samplers;
	
	loadSampleMaps(samplerData);
	
	if (!effectIds.contains("patchGain"))
		return;

	local patchGain = effects[effectIds.indexOf("patchGain")];
	local gain = isDefined(patch.gain) == 1 ? patch.gain : 0;
	patchGain.setAttribute(patchGain.Gain, gain);
}

inline function changeArticulation(index: number)
{
	if (index == -1)
		return;

	local articulation = ArticulationDataManager.getArticulation(index);

	if (!isDefined(articulation))
		return;

	setKeyRanges(isDefined(articulation.keyranges) ? articulation.keyranges : []);
	setAttributes(scripts, scriptIds, scriptAttributeIds, articulation.scripts);
	setAttributes(modulators, modulatorIds, modulatorAttributeIds, articulation.modulators);
	setAttributes(effects, effectIds, effectAttributeIds, articulation.effects);
	setAttributes(samplers, samplerIds, samplerAttributeIds, articulation.samplers);
	enableMuters(articulation.muters);
}

inline function loadManifestConfiguration()
{
	setAttributes(scripts, scriptIds, scriptAttributeIds, Manifest.scripts);
	setAttributes(modulators, modulatorIds, modulatorAttributeIds, Manifest.modulators);
	setAttributes(effects, effectIds, effectAttributeIds, Manifest.effects);
	setAttributes(samplers, samplerIds, samplerAttributeIds, Manifest.samplers);
	setKeyRanges(isDefined(Manifest.keyranges) ? Manifest.keyranges : []);
}

inline function: Array getModules(idList: Array, type: string)
{
	local result = [];

	for (id in idList)
	{
		switch (type)
		{
			case "script":
			case "muter": result.push(Synth.getMidiProcessor(id)); break;
			case "modulator": result.push(Synth.getModulator(id)); break;
			case "effect": result.push(Synth.getEffect(id)); break;
			case "sampler": result.push(Synth.getChildSynth(id)); break;
			case "samplerTable": result.push(Synth.getTableProcessor(id)); break;				
		}
	}
	
	return result;
}

inline function: JSON getAttributeIds(modules: Array)
{
    local result = {};

    for (m in modules)
    {
        result[m.getId()] = [];
        
        for (i = 0; i < m.getNumAttributes(); i++)
            result[m.getId()].push(m.getAttributeId(i));
    }

    return result;
}

inline function: Array getModulatorIds()
{
	local result = [];
	
	for (m in Synth.getAllModulators(""))
	{
		if (m.getType() != "ModulatorChain")
			result.push(m.getId());			
	}

	return result;
}

inline function: Array getEffectIds()
{
	local result = [];

	for (e in Synth.getAllEffects(""))
	{
		if (e.getId() != "FX")
			result.push(e.getId());
	}
	
	return result;
}

inline function setAttributes(modules, moduleIds: Array, attributeIds: JSON, data)
{
	if (!isDefined(modules))
		return;

	local extraAttributes = ["Bypass", "Intensity", "File", "Table", "CrossfadeTable", "Bipolar"];

	if (!modules.length || !moduleIds.length || !isDefined(data) || !data.length)
		return;

	for (d in data)
	{
		local moduleId = d.id;
	    local properties = d.properties;
	    local index = moduleIds.indexOf(moduleId);
	    
	    if (isDefined(properties.Ignore))
	    	continue;

	    if (!isDefined(moduleId) || !isDefined(properties) || index == -1)
	    	continue;

	    if (!moduleIds.contains(moduleId))
		    return Console.print("Configuration: Module not found - " + moduleId + " - in setAttributes.");

		local module = modules[index];
		local attributes = attributeIds[moduleId];

		module.setBypassed(false);

		for (p in properties)
		{
			if (!attributes.contains(p) && !extraAttributes.contains(p))
				continue;

			local value = properties[p];
			setAttribute(module, attributes.indexOf(p), p, value);
			
			if (p == "CrossfadeGroups" && value > 0 && !isDefined(properties.CrossfadeTable))
				setDefaultCrossfadeTables(index, value);
		}
	}
}

inline function setAttribute(module: ScriptObject, attribute: number, property: string, value)
{
	local moduleId = module.getId();

	switch(property)
	{
		case "Bypass":
			module.setBypassed(value);
			break;

		case "Gain":
			if (samplerIds.contains(moduleId))
				module.setAttribute(attribute, Engine.getGainFactorForDecibels(value));
			else
				module.setAttribute(attribute, value);
			break;

		case "Intensity":
			module.setIntensity(value);
			break;
		
		case "File":
			if (value != "")
				Synth.getAudioSampleProcessor(moduleId).setFile(Expansions.getWildcardReference(value));
			else
				module.setAttribute(attribute, value);
			break;
		
		case "CrossfadeTable":
			setCrossfadeTables(samplerTables[samplerIds.indexOf(moduleId)], value);
			break;
				
		case "Table":
			module.asTableProcessor().restoreFromBase64(value[0], value[1]);
			break;
			
		case "Bipolar":
			module.setIsBipolar(value);
			break;

		default:
			module.setAttribute(attribute, value);
	}
}

inline function setDefaultCrossfadeTables(samplerIndex: number, numGroups: number)
{
	local tableProcessor = samplerTables[samplerIndex];

	for (i = 0; i < numGroups; i++)
	{
		local t = tableProcessor.getTable(i);

		t.reset();

		for (j = 0; j < numGroups - 2; j++)
			t.addTablePoint(0.5 + j * 0.05, 0.5);

		for (j = 0; j < numGroups; j++)
		{
			local normX = j / (numGroups - 1);			
			local y = j == i ? 1.0 : 0.0;

			t.setTablePoint(j, normX, y, 0.5);
		}
	}	
}

inline function setCrossfadeTables(samplerTable: ScriptObject, data: Array)
{
	if (!isDefined(samplerTable))
		return Console.print("Configuration: Sampler table not found.");

	for (i = 0; i < data.length; i++)
		samplerTable.restoreFromBase64(i, data[i]);
}

inline function clearSamplers(samplersToSkip: Array)
{
	for (s in samplers)
	{
		if (samplersToSkip.contains(s))
			continue;

		s.setBypassed(true);
		s.setAttribute(s.VoiceAmount, 1);
		s.setAttribute(s.VoiceLimit, 2);
		s.asSampler().clearSampleMap();
	}
}

inline function loadSampleMaps(data)
{
	local activeSamplers = [];	

	for (x in data)
	{
		local s = samplers[samplerIds.indexOf(x.id)];		
		local sampleMap = x.properties.SampleMap;

		if (!isDefined(sampleMap))
			continue;

		s.setBypassed(false);
		
		if (s.asSampler().getCurrentSampleMapId() != sampleMap)
			s.asSampler().loadSampleMap(sampleMap);

		s.asSampler().setActiveGroup(1);
		activeSamplers.push(s);
	}

	clearSamplers(activeSamplers);
}

inline function enableMuters(mutersToEnable: Array)
{
	if (!mutersToEnable.length)
		return;

	for (i = 0; i < muters.length; i++)
		muters[i].setAttribute(muters[i].ignoreButton, !mutersToEnable.contains(i));
}

inline function setKeyRanges(data: Array)
{
	if (!data.length)
		return;

	local keyColours = Manifest.keyColours;

	if (!isDefined(keyColours))
		return;

	for (x in data)
	{
		if (!isDefined(x.loKey) || !isDefined(x.hiKey))
			continue;

		for (i = x.loKey; i <= x.hiKey; i++)
		{
			if (typeof(x.colour) !== "string")
				continue;

			local isBlack = [1, 3, 6, 8, 10].contains(i % 12);
			local c = keyColours[x.colour][isBlack];

			if (!isDefined(c))
				continue;

			Engine.setKeyColour(i, c);
		}
	}
}

inline function resetKeyColours()
{
	local colours;

	if (!isDefined(Manifest.keyColours.inactive) || !Array.isArray(Manifest.keyColours.inactive))
		colours = [0x55414141, 0x55414141];
	else
		colours = Manifest.keyColours.inactive;

	for (i = 0; i < 128; i++)
	{
		local isBlack = [1, 3, 6, 8, 10].contains(i % 12);
		Engine.setKeyColour(i, colours[isBlack]);
	}
}

function onNoteOn()
{
	local n = Message.getNoteNumber();
	local index = ArticulationDataManager.getArticulationIndexForKeyswitch(n);

	if (index == -1)
		return;

	knbArticulation.setValue(index);
	knbArticulation.changed();
}
 function onNoteOff()
{
	
}
 function onController()
{
	local cn = Message.getControllerNumber();
	local cv = Message.getControllerValue();

	if (cn == 123)
		return Engine.allNotesOff();

	if ((ccNumber == 32 && !useUacc) && !Message.isProgramChange())
		return;

	local index = ArticulationDataManager.getArticulationIndexForProgram(cv);

	if (index != -1)
		changeArticulation(index);
}
 function onTimer()
{
	
}
 function onControl(number, value)
{
	
}
 