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

namespace ArticulationDataManager
{
	const articulations = [];
	const programs = [];
	const keyswitches = [];

	inline function updateArticulationData(patch)
	{
	    local map = {};
	    local defaults;
	    
	    articulations.clear();
	
	    if (isDefined(Manifest.articulations))
	    {
	        for (x in Manifest.articulations)
	        {
	            if (x.id.toLowerCase() == "defaults")
	            {
	                defaults = x;
	                continue;
	            }
	
				local obj = x.clone();
				articulations.push(obj);
				map[obj.id] = obj;
	        }
	    }
	
	    if (isDefined(patch.articulations))
	    {
	        for (x in patch.articulations)
	        {
	            local obj = map[x.id];
	
	            if (isDefined(obj))
	            {
	                merge(obj, x, true);
	                continue;
	            }
	
				obj = x.clone();
				articulations.push(obj);
				map[obj.id] = obj;
	        }
	    }
	
	    if (!isDefined(defaults))
	        return articulations;
	
	    for (x in articulations)
	        merge(x, defaults, false);
	}
	
	inline function updateTriggers(patch: JSON)
	{
		programs.clear();
		keyswitches.clear();
		
		local firstKs = patch.firstKs;

		for (i = 0; i < articulations.length; i++)
		{
			local obj = articulations[i];
		
			if (!isDefined(obj.ks) && isDefined(firstKs))
				obj.ks = firstKs + i;
		
			keyswitches.push(obj.ks);				

			if (!isDefined(obj.program))
				obj.program = i;

			programs.push(obj.program);
		}
	}

	// Recursive function cannot be inline
	function merge(base, source, allowOverride)
	{
	    if (!isDefined(source) || !isObject(source))
	        return base;
	
	    var keys = Object.keys(source);
	
	    for (i = 0; i < keys.length; i++)
	    {
	        var k = keys[i];
	
	        if (k == "id")
	            continue;
	
	        var s = source[k];
	        var b = base[k];
	
	        if (Array.isArray(b) && Array.isArray(s))
	            base[k] = mergeArray(b, s, allowOverride);
	        else if (isObject(b) && isObject(s))
	            merge(b, s, allowOverride);
	        else if (allowOverride || !isDefined(b))
	            base[k] = s;
		}
	
		return base;
	}
	
	inline function: Array mergeArray(baseArray: Array, sourceArray: Array, allowOverride: number)
	{
		local result = [];
		local map = {};
		
	    for (i = 0; i < baseArray.length; i++)
	    {
	        local item = baseArray[i];
	
			if (isDefined(item.id))
				map[item.id] = item;
			else
				result.push(item);
		}
		
	    for (i = 0; i < sourceArray.length; i++)
	    {
	        local item = sourceArray[i];
	        
			if (isDefined(item.id) && isDefined(map[item.id]))
				merge(map[item.id], item, allowOverride);
			else
				result.push(item.clone());
		}
	
	    for (id in map)
	        result.push(map[id]);
	
		return result;
	}
	
	inline function: number isObject(variable)
	{
	    return typeof(variable) == "object" && !Array.isArray(variable);
	}
	
	inline function getArticulation(index: number)
	{
		return articulations[index];
	}

	inline function getAllArticulations()
	{
		return articulations;
	}

	inline function: number getArticulationIndexForKeyswitch(noteNumber: number)
	{
		return keyswitches.indexOf(noteNumber);
	}
	
	inline function: number getArticulationIndexForProgram(programNumber: number)
	{
		return programs.indexOf(programNumber);
	}

	//! Broadcasters
	const bcPatchChanged = Engine.createBroadcaster({id: "patchChanged", args: ["component", "value"], priority: 0});
	bcPatchChanged.attachToComponentValue(["knbPatch", "Patch"], "");
	
	bcPatchChanged.addListener(0, "Patch change listener", function(component, value)
	{
		var patch = Manifest.patches[value];

		if (!isDefined(patch))
			return;

		updateArticulationData(patch);
		updateTriggers(patch);
	});
}
