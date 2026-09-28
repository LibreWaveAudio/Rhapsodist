/*
    Copyright 2025, 2026 David Healey

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
@description: Creates a flex ahdsr UI using a floating tile and knobs.
              Knobs for attack level and the various curve parameters are hidden by default
              as they are only needed for preset store/restore.
              The user can set those values on the floating tile itself.
@entry: create().
@usage: The module tree should contain AhdsrController.js with the ID passed to the create function.
		A flex envelope ID should be passed in, this is what the floating tile will display.
*/

namespace EnvelopePanel
{
	const style = CoreLookAndFeel.style;
	const fonts = style.fonts;
	const parameters = ["Attack", "Hold", "Decay", "Sustain", "Release", "AttackLevel", "AttackCurve", "DecayCurve", "ReleaseCurve"];

	inline function: ScriptObject create(panelId: string, processorId: string, flexEnvelopeId: string, options: JSON)
	{
		local parentPanel = Content.getComponent(panelId);
		local pnlEnvelope = createContainer(parentPanel, options);
		local fltEnvelope = createFloatingTile(pnlEnvelope, flexEnvelopeId, options);
		local pnlEnvelopeControls = createControlPanel(pnlEnvelope, options);
		local knbAhdsr = createControls(pnlEnvelopeControls, processorId, flexEnvelopeId, options);

		if (!isDefined(options.defaultLayout) || options.defaultLayout)
			Container.createRow(pnlEnvelopeControls.getId(), [0, 0, 0, 0], -1, {});

		bcpnlControlsMouse.attachToComponentMouseEvents([pnlEnvelopeControls, fltEnvelope], "Clicks, Hover & Dragging", "");
		bcpnlControlsMouse.addListener(knbAhdsr, "Alt click restore defaults.", function(component, event)
		{
			if (!event.altDown || !event.clicked || event.rightClick || event.drag)
				return;

			for (x in this)
			{
				x.setValue(x.get("defaultValue"));
				x.changed();
			}
		});

		pnlEnvelope.data.graph = fltEnvelope;
		pnlEnvelope.data.controlPanel = pnlEnvelopeControls;
		pnlEnvelope.data.controls = knbAhdsr;

		return pnlEnvelope;
	}
	
	inline function: ScriptObject createContainer(parentPanel: ScriptObject, options: JSON)
	{
		local id = "pnlEnvelope" + (isDefined(options.index) ? options.index : "");
		local componentExists = Content.componentExists(id);
		local panel = Content.addPanel(id);
		
		if (!componentExists)
		{
			Content.setPropertiesFromJSON(id, {
				x: 0,
				y: 0,
				width: parentPanel.getWidth(),
				height: parentPanel.getHeight(),
				parentComponent: parentPanel.getId(),
				text: "",
				bgColour: 0x0,
				itemColour: 0x0,
				itemColour2: 0x0,
				borderRadius: 0,
				borderSize: 0
			});
		}
		
		return panel;
	}
		
	inline function: ScriptObject createFloatingTile(parentPanel: ScriptObject, flexEnvelopeId: string, options: JSON)
	{
		local id = "fltEnvelope";
		local componentExists = Content.componentExists(id);
		local tile = Content.addFloatingTile(id);
		local props = {};

		if (!componentExists)
		{
			props = {
				x: 10,
				y: 10,
				width: parentPanel.getWidth() - 20,
				height: (parentPanel.getHeight() / 2),
				parentComponent: parentPanel.getId(),
				bgColour: 0x0
			};
		}

		props.ContentType = "FlexAHDSRGraph";
		props.Data = "{\n  \"ProcessorId\": \"" + flexEnvelopeId + "\",\n  \"Index\": -1,\n  \"FollowWorkspace\": false,\n  \"CurvePointTolerance\": 20,\n  \"UseOneDimensionDrag\": false,\n  \"ShowBall\": true\n}";

		Content.setPropertiesFromJSON(id, props);
		
		tile.setLocalLookAndFeel(laf);

		return tile;
	}

	inline function: ScriptObject createControlPanel(parentPanel: ScriptObject, options: JSON)
	{
		local id = parentPanel.getId() + "Controls";
		local componentExists = Content.componentExists(id);
		local panel = Content.addPanel(id);

		if (!componentExists)
		{
			Content.setPropertiesFromJSON(id, {
				x: 0,
				y: parentPanel.getHeight() / 2 + 10,
				width: parentPanel.getWidth(),
				height: (parentPanel.getHeight() / 2),			
				parentComponent: parentPanel.getId(),
				text: "",
				bgColour: 0x0,
				itemColour: 0x0,
				itemColour2: 0x0,
				textColour: 0x0,
				borderRadius: 0,
				borderSize: 0
			});
		}
				
		return panel;
	}

	inline function: Array createControls(parentPanel: ScriptObject, processorId: string, flexEnvelopeId: string, options: JSON)
	{
		local knobs = [];

		local properties = [
			{
				text: "A",
				parameter: "Attack",
				mode: "Time",
				defaultValue: 2,
				middlePosition: 1000,
				tooltip: "Envelope attack time"
			},
			{
				text: "H",
				parameter: "Hold",
				mode: "Time",
				defaultValue: 10,
				middlePosition: 1000,
				tooltip: "Envelope hold time"
			},
			{
				text: "D",
				parameter: "Decay",
				mode: "Time",
				defaultValue: 300,
				middlePosition: 1000,
				tooltip: "Envelope decay time"
			},
			{
				text: "S",
				parameter: "Sustain",
				mode: "NormalizedPercentage",
				defaultValue: 0.9,
				middlePosition: 0.5,
				tooltip: "Envelope sustain level"
			},
			{
				text: "R",
				parameter: "Release",
				mode: "Time",
				defaultValue: 5000,
				middlePosition: 1000,
				tooltip: "Envelope release time"
			},
			{
				text: "Atk Level",
				parameter: "AttackLevel",
				mode: "NormalizedPercentage",
				defaultValue: 1.0,
				middlePosition: 0.5,
				tooltip: "Envelope attack level",
				visible: false
			},
			{
				text: "Atk Curve",
				parameter: "AttackCurve",
				mode: "NormalizedPercentage",
				defaultValue: 0.5,
				middlePosition: 0.5,
				tooltip: "Envelope attack cruve",
				visible: false
			},
			{
				text: "Decay Curve",
				parameter: "DecayCurve",
				mode: "NormalizedPercentage",
				defaultValue: 0.1,
				middlePosition: 0.5,
				tooltip: "Envelope decay curve",
				visible: false
			},
			{
				text: "Release Curve",
				parameter: "ReleaseCurve",
				mode: "NormalizedPercentage",
				defaultValue: 0.3,
				middlePosition: 0.5,
				tooltip: "Envelope release curve",
				visible: false
			}
		];
		
		local knobHeight = 90;
		local knobWidth = 62;

		if (isDefined(options.knobHeight) && options.knobHeight < knobHeight)
			knobHeight = options.knobHeight;

		for (i = 0; i < properties.length; i++)
		{
			local id = parentPanel.getId().replace("Controls").replace("Envelope", "Ahdsr").replace("pnl", "knb") + i;
			local componentExists = Content.componentExists(id);
			local knob = Content.addKnob(id);			
			local props = {};

			for (x in properties[i])
			{
				if (componentExists && x == "defaultValue")
					continue;

				props[x] = properties[i][x];
			}

			props.width = knobWidth;
			props.height = knobHeight;
			props.parentComponent = parentPanel.getId();
			props.saveInPreset = true;
			props.processorId = processorId;
			props.parameterId = props.parameter;

			if (!componentExists)
				props.pluginParameterName = props.parameter;

			Content.setPropertiesFromJSON(id, props);

			knob.setLocalLookAndFeel(laf);			
			knobs.push(knob);			
		}

		// Listeners
		bcFloatingTileDrag.attachToModuleParameter(flexEnvelopeId, parameters, "");
		bcFloatingTileDrag.addListener(knobs, "Update ahdsr knobs", function(moduleId, parameter, value)
		{
			var index = parameters.indexOf(parameter);

			if (!isDefined(this[index]))
				return;

			this[index].setValue(value);
			this[index].changed();
		});

		return knobs;
	}

	//! Look and Feel
	const laf = Content.createLocalLookAndFeel();
	
	laf.registerFunction("drawFlexAhdsrBackground", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawAhdsrBackground))
			return LookAndFeel.drawAhdsrBackground();

		g.setColour(obj.bgColour);
		g.fillRoundedRectangle(obj.area, 2);
	});
	
	laf.registerFunction("drawFlexAhdsrFullPath", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawFlexAhdsrFullPath))
			return LookAndFeel.drawFlexAhdsrFullPath();

		var a = obj.area;
		var fillColour = Colours.withMultipliedAlpha(obj.itemColour2, obj.enabled ? 0.5 : 0.1);

		g.setGradientFill([fillColour, a[2] / 2, a[1], Colours.withMultipliedAlpha(fillColour, 0.1), a[2] / 2, a[3]]);
		g.fillPath(obj.path, obj.pathArea);

		g.setColour(Colours.withAlpha(obj.itemColour, obj.enabled ? 1.0 : 0.5));
		g.drawPath(obj.path, obj.pathArea, 2.0);
	});
	
	laf.registerFunction("drawFlexAhdsrSegment", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawFlexAhdsrSegment))
			return LookAndFeel.drawFlexAhdsrSegment();

		var a = obj.area;
		var fillColour = Colours.withMultipliedAlpha(obj.itemColour2, 0.5);
	
		if (!obj.active)
			return;
	
		g.setGradientFill([fillColour, a[2] / 2, a[1], Colours.withMultipliedAlpha(fillColour, 0.1), a[2] / 2, a[3]]);
		g.fillPath(obj.path, obj.path.getBounds(1));
	});
	
	laf.registerFunction("drawFlexAhdsrCurvePoint", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawFlexAhdsrCurvePoint))
			return LookAndFeel.drawFlexAhdsrCurvePoint();

		if (!obj.hover)
			return;

		var a = Rectangle(obj.curvePoint[0] - 4, obj.curvePoint[1] - 4, 8, 8);
				
		g.setColour(Colours.withMultipliedBrightness(obj.itemColour, 1.2));
		g.fillEllipse(a);
	});
	
	laf.registerFunction("drawFlexAhdsrDragPoint", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawFlexAhdsrDragPoint))
			return LookAndFeel.drawFlexAhdsrDragPoint();

		if (!obj.hover)
			return;

		var a = Rectangle(obj.dragPoint[0] - 4, obj.dragPoint[1] - 4, 8, 8);

		g.setColour(Colours.withMultipliedBrightness(obj.itemColour, 1.2));
		g.drawRect(a, 2);
	});
	
	laf.registerFunction("drawFlexAhdsrPosition", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawFlexAhdsrPosition))
			return LookAndFeel.drawFlexAhdsrPosition();
	});
	
	laf.registerFunction("drawFlexAhdsrBall", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawFlexAhdsrBall))
			return LookAndFeel.drawFlexAhdsrBall();
	
		if (!obj.enabled)
			return;

		var a = Rectangle(obj.position[0] - 8, obj.position[1] - 8, 16, 16);

		g.setColour(Colours.withMultipliedAlpha(obj.itemColour3, 0.5));
		g.fillEllipse(a);
	
		g.setColour(obj.itemColour3);
		g.fillEllipse(a.reduced(3));
	});
	
	laf.registerFunction("drawFlexAhdsrText", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawFlexAhdsrText))
			return LookAndFeel.drawFlexAhdsrText();
	});

	laf.registerFunction("drawRotarySlider", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawAhdsrKnob))
			return LookAndFeel.drawAhdsrKnob();
	
		CoreLookAndFeel.drawKnob();
	});
	
	//! Broadcasters
		
	//! bcFloatingTileDrag
	const bcFloatingTileDrag = Engine.createBroadcaster({id: "envelopeFloatingTileDrag", args: ["id", "parameter", "value"]});
	
	//! bcpnlControlsMouse
	const bcpnlControlsMouse = Engine.createBroadcaster({id: "clickWatcher", args: ["component", "event"]});
}
