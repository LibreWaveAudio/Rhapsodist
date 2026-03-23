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

namespace ModuleTreeBuilder
{
	const builder = Synth.createBuilder();

	inline function run(options: JSON)
	{
		builder.clear();
		addModules(options);
		builder.flush();
	}

	inline function addModules(options: JSON)
	{
		local index;

		// Global Modulation Container
		local globalModContainerIndex = builder.create(builder.SoundGenerators.GlobalModulatorContainer, "globalModulators", 0, builder.ChainIndexes.Direct);

		// Ahdsr
		if (isDefined(options.ahdsr))
		{
			index = builder.create(builder.MidiProcessors.ScriptProcessor, "ahdsrController", 0, builder.ChainIndexes.Midi);
			builder.connectToScript(index, "{PROJECT_FOLDER}Rhapsodist/Processors/AhdsrController.js");
			builder.create(builder.Modulators.AHDSR, "globalAhdsr", globalModContainerIndex, builder.ChainIndexes.GlobalMod);
		}
		
		// Velocity
		if (isDefined(options.velocity))
		{
			index = builder.create(builder.MidiProcessors.ScriptProcessor, "velocityHandler", 0, builder.ChainIndexes.Midi);
			builder.connectToScript(index, "{PROJECT_FOLDER}Rhapsodist/Processors/VelocityHandler.js");
			builder.create(builder.Modulators.Velocity, "velocity",  globalModContainerIndex, builder.ChainIndexes.GlobalMod);
		}

		// Pitch Wheel
		builder.create(builder.Modulators.PitchWheel, "pitchWheel", globalModContainerIndex, builder.ChainIndexes.GlobalMod);

		// Master Gain
		index = builder.create(builder.Effects.ScriptFX, "masterGain", 0, builder.ChainIndexes.FX);
		builder.connectToScript(index, "{PROJECT_FOLDER}Rhapsodist/Core/ScriptFX/MultiChannelGain.js");

		// Scripts
		index = builder.create(builder.MidiProcessors.ScriptProcessor, "configurationHandler", 0, builder.ChainIndexes.Midi);
		builder.connectToScript(index, "{PROJECT_FOLDER}Rhapsodist/Core/Processors/ConfigurationHandler.js");
		
		// Container
		local containerIndex = builder.create(builder.SoundGenerators.SynthChain, "container0", 0, builder.ChainIndexes.Direct);

		index = builder.create(builder.MidiProcessors.ScriptProcessor, "noteRangeFilter", containerIndex, builder.ChainIndexes.Midi);
		builder.connectToScript(index, "{PROJECT_FOLDER}Rhapsodist/Processors/NoteRangeFilter.js");
		
		index = builder.create(builder.MidiProcessors.ScriptProcessor, "tuningHandler", containerIndex, builder.ChainIndexes.Midi);
		builder.connectToScript(index, "{PROJECT_FOLDER}Rhapsodist/Core/Processors/TuningHandler.js");

		index = builder.create(builder.MidiProcessors.ScriptProcessor, "purgeHandler", containerIndex, builder.ChainIndexes.Midi);
		builder.connectToScript(index, "{PROJECT_FOLDER}Rhapsodist/Core/Processors/SamplerPurgeHandler.js");

		if (isDefined(options.expression))
		{
			index = builder.create(builder.Modulators.MidiController, "expressionCC", containerIndex, builder.ChainIndexes.Gain);
			local mod = builder.get(index, builder.InterfaceTypes.Modulator);
			mod.setAttribute(mod, {"ControllerNumber": 94});
		}
		
		if (isDefined(options.samplers))
			addSamplers(containerIndex, options);

		// Mic Mixer
		local channels = isDefined(options.channels) ? options.channels : 1;
		addMixer(channels);
	}
	
	inline function addSamplers(containerIndex: number, options: JSON)
	{
		local index;

		for (i = 0; i < options.samplers; i++)
		{
			local samplerIndex = builder.create(builder.SoundGenerators.StreamingSampler, "sampler" + i, containerIndex, builder.ChainIndexes.Direct);
			builder.clearChildren(samplerIndex, builder.ChainIndexes.Gain);
						
			// Muter
			if (isDefined(options.muters))
				builder.create(builder.MidiProcessors.MidiMuter, "sampler" + i + "MidiMuter", samplerIndex, builder.ChainIndexes.Midi);
			
			// Round Robin
			if (isDefined(options.roundRobin))
			{
				index = builder.create(builder.MidiProcessors.ScriptProcessor, "sampler" + i + "roundRobin", samplerIndex, builder.ChainIndexes.Midi);
				builder.connectToScript(index, "{PROJECT_FOLDER}Rhapsodist/Processors/RoundRobin.js");
			}

			// Envelope
			if (isDefined(options.ahdsr))
				builder.create(builder.Modulators.AHDSR, "sampler" + i + "GainAhdsr", samplerIndex, builder.ChainIndexes.Gain);
			else
				builder.create(builder.Modulators.SimpleEnvelope, "sampler" + i + "GainSimpleEnvelope", samplerIndex, builder.ChainIndexes.Gain);
			
			// Velocity
			if (isDefined(options.velocity))
			{				
				index = builder.create(builder.Modulators.GlobalVoiceStartModulator, "sampler" + i + "GainVelocity", samplerIndex, builder.ChainIndexes.Gain);
				local velocityMod = builder.get(index, builder.InterfaceTypes.Modulator);
				velocityMod.connectToGlobalModulator("globalModulators", "velocity");
			}
			
			// Pitch Wheel
			index = builder.create(builder.Modulators.GlobalTimeVariantModulator, "sampler" + i + "PitchWheel", samplerIndex, builder.ChainIndexes.Pitch);
			local pitchMod = builder.get(index, builder.InterfaceTypes.Modulator);
			pitchMod.connectToGlobalModulator("globalModulators", "pitchWheel");
		}
	}

	inline function addMixer(channels: number)
	{
		local index = builder.create(builder.MidiProcessors.ScriptProcessor, "mixerHandler", 0, builder.ChainIndexes.Midi);
		builder.connectToScript(index, "{PROJECT_FOLDER}Rhapsodist/Processors/MixerHandler.js");

		local rootMatrix = Synth.getRoutingMatrix("rhapsodist");
		rootMatrix.setNumChannels(channels * 2);
		
		local masterMatrix = Synth.getRoutingMatrix("masterGain");

		local containerMatrix = Synth.getRoutingMatrix("container0");
		containerMatrix.setNumChannels(channels * 2);

		for (i = 0; i < channels; i++)
		{
			rootMatrix.addConnection(i * 2, 0);
			rootMatrix.addConnection(i * 2 + 1, 1);
			masterMatrix.addConnection(i * 2, i * 2);
			masterMatrix.addConnection(i * 2 + 1, i * 2 + 1);
			containerMatrix.addConnection(i * 2, i * 2);
			containerMatrix.addConnection(i * 2 + 1, i * 2 + 1);
			
			if (channels == 1)
				return;

			local index = builder.create(builder.Effects.SimpleGain, "mixerGain" + i, 0, builder.ChainIndexes.FX);
			local matrix = builder.get(index, builder.InterfaceTypes.RoutingMatrix);
			matrix.addConnection(i * 2, i * 2);
			matrix.addConnection(i * 2 + 1, i * 2 + 1);
		}
	}
}