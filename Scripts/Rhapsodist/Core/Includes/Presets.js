/*
    Copyright 2024, 2025, 2026 David Healey

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

namespace Presets
{
	const style = CoreLookAndFeel.style;
	const fonts = style.fonts;

	const automationDataFile = Expansions.getAppDataFolder().getChildFile("automation.xml");
	const automationDefaults = Engine.createMidiAutomationHandler().getAutomationDataObject();

	reg favouriteButtonState = false;
	reg currentPresetFile;
	reg isInternal = true;

	//! User Preset Handler
	const uph = Engine.createUserPresetHandler();

	uph.setPreCallback(function(presetData)
	{
		if (isDefined(UserPresetProcessor.process) && uph.isOldVersion(presetData.version))
			UserPresetProcessor.process(presetData);

		isInternal = uph.isInternalPresetLoad();
		broadcasters.preLoad.sendAsyncMessage(isInternal);
	});

	uph.setPostCallback(function(presetFile)
	{
		currentPresetFile = presetFile;
		updatePresetLabel(true);
		broadcasters.postLoad.sendAsyncMessage(isInternal);
	});

	uph.setPostSaveCallback(function(presetFile)
	{
		currentPresetFile = presetFile;
		updatePresetLabel(true);
	});
	
	if (isDefined(UserPresetProcessor.process))
		uph.setEnableUserPresetPreprocessing(true, true);

	//! pnlPresetDisplay
	const pnlPresetDisplay = Content.getComponent("pnlPresetDisplay");

	pnlPresetDisplay.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);
		var border = this.get("borderSize");
		var radius = this.get("borderRadius");

		g.setColour(this.get("bgColour"));
		g.fillRoundedRectangle(a, radius);

		g.setColour(Colours.withAlpha(Colours.black, 0.5));
		g.drawRoundedRectangle([a[0] + border / 2, a[1] + border / 2, a[2] - border, a[3] - border], radius, border);
		
		if (!isDefined(style.useNoise) || style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a, monochromatic: true});
	});

	//! btnPresetBrowser
	const btnPresetBrowser = Content.getComponent("btnPresetBrowser");
	btnPresetBrowser.setControlCallback(onbtnPresetBrowserControl);
	
	inline function onbtnPresetBrowserControl(component, value)
	{		
		value == 1 ? show() : hide();
	}
	
	const lafbtnPresetBrowser = Content.createLocalLookAndFeel();
	btnPresetBrowser.setLocalLookAndFeel(lafbtnPresetBrowser);
		
	lafbtnPresetBrowser.registerFunction("drawToggleButton", function(g, obj)
	{
		var a = obj.area;

		g.setFont("phosphor", 16);

		var c;
		
		if (style.mode == "dark")
			c = Colours.withMultipliedBrightness(obj.textColour, obj.over ? 1.0 - 0.2 * obj.down : 0.7);
		else
			c = Colours.withMultipliedBrightness(obj.textColour, obj.over ? 1.5 + 0.5 * obj.down : 0.7);

		g.setColour(c);		
		g.drawAlignedText(obj.value ? "\ue13c" : "\ue136", [a[0] + 7, a[1], a[2], a[3]], "left");

		var font = fonts.regular;
		var fontSize = 18 + fonts.size;
		var textOffsetY = isDefined(style.presets.displayTextOffsetY) ? style.presets.displayTextOffsetY : 0;

		g.setFont(font, fontSize);
		g.setColour(Colours.withMultipliedBrightness(obj.textColour, obj.over ? 1.0 - 0.2 * obj.down : 0.9));
		g.drawAlignedText(obj.text, [a[0] + 25, a[1] + textOffsetY, a[2], a[3]], "centred");
	});
		
	//! btnPreset
	const btnPreset = Content.getAllComponents("btnPreset\\d");
	const lafbtnPreset = Content.createLocalLookAndFeel();
	
	for (x in btnPreset)
	{
		x.setControlCallback(onbtnPresetControl);
		x.setLocalLookAndFeel(lafbtnPreset);
	}

	inline function onbtnPresetControl(component, value)
	{
		if (value)
			return;

		local index = btnPreset.indexOf(component);	
		index == 0 ? Engine.loadPreviousUserPreset(false) : Engine.loadNextUserPreset(false);
	}
	
	lafbtnPreset.registerFunction("drawToggleButton", function(g, obj)
	{
		var a = obj.area;

		g.setFont("phosphor", 14);
		g.setColour(Colours.withMultipliedBrightness(obj.textColour, obj.over ? 1.0 - 0.2 * obj.value : 0.8));
		g.drawAlignedText(String.fromCharCode(obj.text), a, "centred");
	});
	
	//! btnPresetSave
	const btnPresetSave = Content.getComponent("btnPresetSave");
	btnPresetSave.setControlCallback(onbtnPresetSaveControl);
	
	inline function onbtnPresetSaveControl(component, value)
	{
		if (value)
			return;
			
		savePreset();
	}
	
	const lafbtnPresetSave = Content.createLocalLookAndFeel();
	btnPresetSave.setLocalLookAndFeel(lafbtnPresetSave);

	lafbtnPresetSave.registerFunction("drawToggleButton", function(g, obj)
	{
		var a = obj.area;

		g.setFont("phosphor", 18);
		g.setColour(Colours.withMultipliedBrightness(obj.textColour, obj.over ? 1.0 - 0.2 * obj.value : 0.8));
		g.drawText(String.fromCharCode(obj.text), a);
	});
	
	//! pnlPresetBrowserContainer
	const pnlPresetBrowserContainer = Content.getComponent("pnlPresetBrowserContainer");
	
	pnlPresetBrowserContainer.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);
		var presetBrowserArea = [pnlPresetBrowser.get("x"), pnlPresetBrowser.get("y") + 5, pnlPresetBrowser.getWidth(), pnlPresetBrowser.getHeight()];
		
		g.fillAll(Colours.withAlpha(Colours.black, 0.5));
		g.drawDropShadow(presetBrowserArea, Colours.withAlpha(Colours.black, 0.6), 25);
	});
	
	pnlPresetBrowserContainer.setMouseCallback(function(event)
	{
		if (event.clicked)
			hide();
	});
	
	//! pnlPresetBrowser
	const pnlPresetBrowser = Content.getComponent("pnlPresetBrowser");
	
	pnlPresetBrowser.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);
		var radius = this.get("borderRadius");
		var borderSize = this.get("borderSize");

		if (isDefined(LookAndFeel.drawPresetBrowserPanel))
			return LookAndFeel.drawPresetBrowserPanel();

		g.setColour(this.get("bgColour"));
		g.fillRoundedRectangle(a, radius);

		if (!isDefined(style.useNoise) || style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a, monochromatic: true});

		g.setColour(this.get("itemColour2"));

		if (borderSize > 0)
			g.drawRoundedRectangle(a.reduced(borderSize / 2), radius, borderSize);
	});
	
	pnlPresetBrowser.setConsumedKeyPresses({"keyCode": 27});
	
	pnlPresetBrowser.setKeyPressCallback(function(event)
	{
		if (!event.isFocusChange)
			hide();
	});

	//! fltPresetBrowser
	const fltPresetBrowser = Content.getComponent("fltPresetBrowser");
	const laffltPresetBrowser = Content.createLocalLookAndFeel();
	fltPresetBrowser.setLocalLookAndFeel(laffltPresetBrowser);
	
	laffltPresetBrowser.registerFunction("drawPresetBrowserBackground", function(g, obj)
	{
		var a = obj.area;
		var bgColour = pnlPresetBrowser.get("bgColour");

		if (isDefined(LookAndFeel.drawPresetBrowserBackground))
			return LookAndFeel.drawPresetBrowserBackground();

		g.fillAll(bgColour);
		
		if (!isDefined(style.useNoise) || style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a, monochromatic: true});
	});

	laffltPresetBrowser.registerFunction("drawPresetBrowserColumnBackground", function(g, obj)
	{
		drawPresetBrowserColumnBackground();
	});
	
	inline function drawPresetBrowserColumnBackground()
	{
		local a = obj.area;
		local itemColour2 = pnlPresetBrowser.get("itemColour2");
		local radius = isDefined(style.presets.columnBorderRadius) ? style.presets.columnBorderRadius : 1;
		local borderSize = isDefined(style.presets.columnBorderSize) ? style.presets.columnBorderSize : 1;
		local font = fonts.semibold;
		local fontSize = 18 + fonts.size;
		local text = obj.text;

		if (obj.text == "Add a Bank" || obj.text == "Select a Nothing")
			text = "Select a Library";
		if (obj.text == "Select a Column")
			text = "Select a Category";

		if (a[2] > 400 && obj.text != "")
			text = "No Results";

		if (isDefined(LookAndFeel.drawPresetBrowserColumnBackground))
			return LookAndFeel.drawPresetBrowserColumnBackground();

		g.setColour(obj.bgColour);
		g.fillRoundedRectangle(a, radius);

		g.setColour(itemColour2);
		g.drawRoundedRectangle(a.reduced(borderSize / 2), radius, borderSize);

		if (isDefined(LookAndFeel.drawPresetBrowserColumnAfterFill))
			LookAndFeel.drawPresetBrowserColumnAfterFill();

		g.setColour(obj.textColour);
		g.setFont(font, fontSize);
		g.drawFittedText(text, a.reduced(20).translated(0, -10), "centred", 3, 1.0);

		if (!isDefined(style.useNoise) || style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a, monochromatic: true});
	}

	laffltPresetBrowser.registerFunction("drawPresetBrowserListItem", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawPresetBrowserListItem))
			return LookAndFeel.drawPresetBrowserListItem();

		drawPresetBrowserListItem();
	});

	inline function drawPresetBrowserListItem()
	{
		local a = obj.area.reduced(3, 1);
		local font = fonts.regular;
		local fontSize = 18 + fonts.size;
		local textOffsetY = isDefined(style.presets.itemTextOffsetY) ? style.presets.itemTextOffsetY : 0;
		local radius = isDefined(style.presets.itemRadius) ? style.presets.itemRadius : 2;
		local featureColour = (isDefined(style.featureColour) && pnlPresetBrowser.get("itemColour") == 0x0) ? style.featureColour : pnlPresetBrowser.get("itemColour");
		
		g.setColour(obj.itemColour);
		g.fillRoundedRectangle(a, radius);
		
		g.setColour(Colours.withMultipliedAlpha(obj.itemColour2, obj.hover && !obj.selected ? 0.6 : 1.0));
		
		if (obj.selected || obj.hover)
		{
			g.fillRoundedRectangle(a, radius);

			if (!isDefined(style.useNoise) || style.useNoise)
				g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a, monochromatic: true});
		}

		g.setColour(featureColour);

		if (obj.selected)
		{
			g.fillRoundedRectangle(a.withWidth(5), {CornerSize: radius, Rounded:[1, 0, 1, 0]});

			if (!isDefined(style.useNoise) || style.useNoise)
				g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a.withWidth(5), monochromatic: true});
		}
		
		g.setFont(font, fontSize);
		g.setColour(Colours.withMultipliedBrightness(obj.textColour, obj.hover || obj.selected ? 1.0 : 0.8));
		
		g.drawFittedText(obj.text.replace(".preset"), [a[0] + 12 + (22 * (obj.columnIndex == 2)), a[1] + textOffsetY, a[2] - 16, a[3]], "left", 1, 1.0);
	}

	laffltPresetBrowser.registerFunction("drawPresetBrowserDialog", function(g, obj)
	{
		obj.area = obj.area.expanded(50);
		CoreLookAndFeel.drawAlertWindow();
	});

	laffltPresetBrowser.registerFunction("drawDialogButton", function(g, obj)
	{
		if (obj.text != "OK" && obj.text != "Cancel")
			return drawEditButton();

		return CoreLookAndFeel.drawDialogButton();
	});
	
	inline function drawEditButton()
	{
		if (isDefined(LookAndFeel.drawPresetBrowserEditButton))
			return LookAndFeel.drawPresetBrowserEditButton();

		local a = obj.area;
		local editButtons = ["Add", "Rename", "Delete"];
		local editIcons = ["\ue3d4", "\ue3b4", "\ue4a8"];

		g.setFont("phosphor", 22);
		
		local c;

		if (style.mode == "dark")
			c = Colours.withMultipliedBrightness(fltPresetBrowser.get("textColour"), obj.over ? 1.0 - 0.2 * obj.down : 0.8);
		else
			c = Colours.withMultipliedBrightness(fltPresetBrowser.get("textColour"), obj.over ? 1.5 + 0.5 * obj.down : 0.8);
			
		g.setColour(c);

		if (editButtons.contains(obj.text))
			return g.drawAlignedText(editIcons[editButtons.indexOf(obj.text)], a, "centred");
		
		if (obj.text != "More")
			return;

		g.setFont("phosphor", 28);
		g.drawAlignedText("\ue1fe", a, "centred");
	}
	
	laffltPresetBrowser.registerFunction("drawPresetBrowserSearchBar", function(g, obj)
	{
		drawPresetBrowserSearchBar();
	});
	
	inline function drawPresetBrowserSearchBar()
	{
		if (isDefined(LookAndFeel.drawPresetBrowserSearchBar))
			return LookAndFeel.drawPresetBrowserSearchBar();

		local a = obj.area;
		local wh = a[3] / 2.0;
		local border = isDefined(style.presets.searchBarBorder) ? style.presets.searchBarBorder : 1;
		local radius = isDefined(style.presets.searchBarRadius) ? style.presets.searchBarRadius : 2;
		
		g.setColour(obj.itemColour3);
		g.fillRoundedRectangle([a[0] + 20, a[1], a[2] - 20, a[3]], radius);
		
		g.setColour(Colours.withAlpha(Colours.black, 0.5));
		g.drawRoundedRectangle([a[0] + 20 + border / 2, a[1] + border / 2, a[2] - border - 20, a[3] - border], radius, border);
		
		if (!isDefined(style.useNoise) || style.useNoise)
			g.addNoise({alpha: 0.02, scaleFactor: 1.5, area: a, monochromatic: true});
		
		g.setFont("phosphor", 18);
		g.setColour(Colours.withAlpha(fltPresetBrowser.get("textColour"), 0.8));
		g.drawAlignedText("\ue30c", [a[0], a[1], a[2] - 5, a[3]], "right");
	}

	laffltPresetBrowser.registerFunction("createPresetBrowserIcons", function(id)
	{
		if (!id.contains("favorite"))
			return;

		var pathData;

		if (id == "favorite_on")
			pathData = "724.t0F..ZBQnXmzCIF..ZBQnXmzCA.fGPTrSD6P..3ADQwtINDa..3ADQwtINDamT3AD8xGHNDaWR4ADMEgFNDaF45ADQ35DNDajH8ADobUCNDaZ..BDgBwANDaKfCBD44M.NDaSmGBDUkX8MDaHULBD43X5MDa4nQBDMMc2MDawgWBDM.lzMDax9cBDQuywMDa69jBDw1FuMDaEgrBDgxerMDaAjzBDI89oMDadF8BDgvjmMDaDGFCDIkQkMDaWjOCDoxEiMDa1bYCDYuAgMDa8tiCDcvEeMDaAYtCDsIRcMDaUY4CDoMmaMDaJtDDDQMEZMDapUPDDcXrXMDa.NbDDQ8bWMDaPUnDDYHWVMDafozDDIEaUMDaxHAEDA8nTMDaEwMEDA3.TMDaXfZEDo7hSMDaoTmEDkOOSMDazKzEDAzESMDadh4EDE6DSMDadh4EDE6DSMjXnQkGDE6DSMj8XPBQUDbXCA.flPzD6j2Phsv4nPDEAG1PXtpKDE6DSMzXmUCQwNwTCw1XmUCQwNwTCwVU0XCQJgxTCw1vBbCQIX1TCwlJOeCQEy7TCw1AZhCQ9vEUCwF1hkCQWPQUCwVGonCQaOeUCwlUrqCQ5quUCwFBrtCQMiBVCwlsmwCQQxWVCwl5dzCQtUuVCwlKQ2CQzIIWCwFD94CQWJkWCwFHk7CQ7RCXCwl8E+CQrdiXCwFJfADQdnEYCwlUyCDQ1poYCwFH+EDQBfOZCwVKCHDQ9A2ZCwVJ+IDQVJfaCwFwxKDQjxJbCwFscMDQ0y1bCwls+NDQFGjcCwVhXPDQFkRdCwl8mQDQZFBeCwlxsRDQbixeCwl0oSDQN5QfCwF9aTDQw3pfCwFCDUDQVIDgCwl9gUDQ7mcgCwlq0UDQcP2gCwFG+UDQy9PhCwF..VDQTrahCwF..VDQTrahCIF..VDQwNQrCA.flPDJ1I8P..nIDghcROzXkA";
		else
			pathData = "2094.t011VQCQL0aTCIFpe5BQL0aTC8nmoPTIRt0P..nIDgFLrMjXvE1HDUhjaMDVf4AQL0aTCQRpXPDS8F0PrQRpXPTS8F0PrYUyWPzQTG0Prcg7VPzJWH0PrQ+EVPjyEJ0Prk2OUPj5eL0PrASZTPDGkO0PrMZkSPj4TS0PrgUwRPjqtW0PrUM9QPzuwb0Pr0ILQPDSch0PrASaPPDavn0PrsvqOPDGpu0Prcp8NPzPI20PrwGQNPTqL+0PrkOlMPDDyG1Pr4H8LPjC6P1PrQ5ULPjKiZ1Pr8ovKPT5oj1Pr4cMKPDnMu1PrwarJPDnL51PrwnMJPDKkE2Pr4IwIPjaUQ2PrsCWIPjgac2PrYZ+HPjg0o2ProQpHPDbg12Pr8rWHPjmtA3PrMuGHPjaSH3Pr8Z5GPDF9N3PrcxuGPTisU3PrQ2mGPTtfb3PrsphGPDgVi3PrkMfGPD1Mp3PrA.fGPz6vr3PrA.fGPz6vr3PhA.fGPz6vG6PCoCIDcmSQOzbyUBQTnozCw1byUBQTnozCwFuLVBQrNqzCwVnlVBQ0przCwVDAWBQg7szCw19aWBQgCuzCwlS2WBQq+uzCwF9RXBQ0vvzCwV5tXBQ2VwzCwVCKYBQqwwzCw1TmYBQMAxzCwVpCZBQZExzCwF+eZBQR9wzCw1N7ZBQ0qwzCwFUXaBQGNwzCw1LzaBQMkvzCwVxObBQLwuzCwl.qbBQNxtzCwlyEcBQbnszCwFGfcBQBTrzCwl14cBQN0pzCwFiLdBQTnozCwFiLdBQTnozCIFuEiBQ24TzCA.fEQz6vG6P..XQD8NLKNDa..XQD8NLKNDaAoWQDIUdINDaHlVQDUsvGNDaf2TQDAoCFNDaXcRQDoYWDNDaLXOQDgPrBNDaZnKQD0dBANDanNGQD8pz9MDaiKBQDQJn6MDa.f7PDQ7e3MDa3L1PDAgb0MDaLSuPDoWdxMDaBzmPD09kuMDanvePD0yyrMDaOJWPDQSHpMDaPBNPDk3imMDaHZDPDA9FkMDaYS5ODs7whMDaruuODcLkfMDaqvjOD0CgdMDaHXYOD82kbMDa3mMODg7yZMDaxgAODsiKYMDaxG0NDU9rWMDa2anNDYaXVMDaDfaNDgHNUMDabVNNDgQNTMDaGAANDs.YSMDaLhyMDgdtRMDa16kMDswNRMDaPPXMDg+4QMDamgJMDEKvQMDaaaEMD0TuQMDaaaEMDwTuQMzXsA.flPjShl7PhYhbgPDd9N7P219BDMY5nNzssu.QuCyhCw1ssu.QuCyhCwV.xu.Q2pdhCwVb9u.QTUJhCw1+Rv.QXF1gCwVmuv.QRAhgCwVNTw.QNINgCwFu.x.QZg5fCwlB0x.Q7LmfCwF.wy.Q7NTfCwFdzz.QbpAfCwFR+0.QxDeeCw1OQ2.QZy6dCwVJp3.QZlYdCwVyI5.QOi3cCwl6u6.QLuXcCwlRb8.QVO5bCwVmN+.QmHcbCwFmFAAQneAbCwF+CCAQxXmaCw1ZFEAQT3NaCwFlMGAQFB3ZCwlJYIAQz4hZCwVxnKAQzhOZCwVF7MAQN.9YCw1tRPAQ0TtYCwFTrRAQJifYCwFcHUAQYsTYCwVwlWAQb0JYCwF2FZAQ27BYCw1TnbAQ8D8XCwFwJeAQnN4XCwVwsgAQfZ2XCwFIohAQnP2XCwFIohAQnP2XCIFTK3AQnP2XCkFjhPjdr61PnNGID0Eq.NDanNGID0Eq.NDaT7GID0C3.NDaGuHIDgtDANDa6lIID4CQANDaliJID4AcANDa+jKIDwlnANDa5pLIDgvyANDaN0MIDcc9ANDarCOIDwqHBNDaKVPID8YRBNDabrQIDYlaBNDaPFSIDgOjBNDabiTIDETrBNDatCVIDwxyBNDa3lWIDUp5BNDaoLYIDs4.CNDaxzZID4eFCNDaBebIDAbKCNDaHKdIDMsOCNDax3eID4RSCNDavmgIDYLVCNDauWiIDYYXCNDacHkIDU4YCNDao4lIDIrZCNDa.qnIDkwZCNDaPbpIDwIZCNDaGMrIDozXCNDaS8sIDgxVCNDahruIDwCTCNDahZwIDsnPCNDaBGyID4gLCNDavwzIDEvGCNDaaZ1IDATBCNDax.3IDcN7BNDalj4IDgf0BNDalE6IDIKtBNDaii7IDoOlBNDaL98IDIucBNDaVU+IDIqTBNDavn.JDAEKBNDaN3AJDQ9.BNDaiCCJDkX1ANDaiJDJDkUqANDaBMEJDI2eANDa2JFJDA+SANDa2CGJDEuGANDa42GJDYI6.NDazlHJD0Ot.NDaXwHJD0Eq.NDaXwHJD0Eq.NjXV9lJDk+3tMzqz6BQnP2XCssUzPDJzM1PrssUzPDJzM1Prce9zPjTEN1PrkJm0PjD2N1PrYnO1PTRIP1Prox21Pjv6Q1Prwhe2PzLNT1PrYxF3PzO.W1PrUas3PDcQZ1PrUWS4PDSAd1PrUf34PjKOh1Prcvb5Pja5l1PrwA.6PjRBr1PrwNh6Pj7kw1PrARC7Pjfj21PrAFi7PTA881Pr0kA8PzctD2Prkrd8PTv2K2PrkU58PzuWS2PrYbT9PjOMa2Pr47r9PD+Vi2PrEyC+Pjqyq2PrY6X+Pj8gz2PrYRr+Pjbf82Pr8z8+PD1VC3PrYfM.QTGDH3PrARa.QjQ2L3PrwGm.QziuQ3Prw+v.QDLrV3PrU33.QjWra3PrQv9.QTSuf3PrklBAQjKzk3PrsZDAQTL5p3PrkjDAQz6vr3PrkjDAQz6vr3PhkjDAQDOdi5Puw3JDwPuCOD..ZBQNIZxCMVY";

		var p = Content.createPath();
		p.loadFromData(pathData);

		return p;
	});

	laffltPresetBrowser.registerFunction("drawPopupMenuBackground", function(g, obj)
	{
		CoreLookAndFeel.drawPopupMenuBackground();
	});
	
	laffltPresetBrowser.registerFunction("drawPopupMenuItem", function(g, obj)
	{
		drawPopupMenuItem();
	});

	inline function drawPopupMenuItem()
	{
		local text = obj.text.toLowerCase();
		local icon = "";
		
		if (text.contains("import") && text.contains("clipboard"))
			icon = "e196";
		else if (text.contains("import") && text.contains("collection"))
			icon = "e61e";
		else if (text.contains("export") && text.contains("clipboard"))
			icon = "e1ca";
		else if (text.contains("export") && text.contains("collection"))
			icon = "e232";
		else
			icon = "e256";
		
		local regex = Engine.getRegexMatches(obj.text, "\\bin\\s+\\w+ ")[0];
		
		if (isDefined(regex))
			obj.text = obj.text.replace(regex);

		obj.text = icon + "-" + obj.text.replace("all ");

		CoreLookAndFeel.drawPopupMenuItem();
	}

	laffltPresetBrowser.registerFunction("getIdealPopupMenuItemSize", function(obj)
	{
		return CoreLookAndFeel.getIdealPopupMenuItemSize();
	});

	laffltPresetBrowser.registerFunction("drawScrollbar", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawPresetBrowserScrollbar))
			return LookAndFeel.drawPresetBrowserScrollbar();
		
		obj.bgColour = Colours.withMultipliedBrightness(obj.itemColour1, 0.5);
		obj.itemColour = obj.textColour;

		CoreLookAndFeel.drawScrollbar();
	});

	const bcMouseClick = Engine.createBroadcaster({id: "mouseClick", args: [component, obj]});	
	bcMouseClick.attachToComponentMouseEvents(["fltPresetBrowser"], "Clicks Only", "");
	
	bcMouseClick.addListener("mouseAction", "Mouse action for preset browser", function(component, event)
	{
		if (event.mouseUp)
			return favouriteButtonState = event.buttonState;

		if (!isDefined(event.columnIndex))
			return;

		if (event.columnIndex != 2)
			return;

		if (event.doubleClick)
			hide();
	});

	//! Functions
	inline function show()
	{
		btnPresetBrowser.setValue(1);
		pnlPresetBrowserContainer.fadeComponent(true, 100);
	}

	inline function hide()
	{
		btnPresetBrowser.setValue(0);
		pnlPresetBrowserContainer.fadeComponent(false, 100);
	}
	
	inline function updatePresetLabel(nameOnly: number)
	{
		if (!isDefined(currentPresetFile))
			return;

		local category = currentPresetFile.getParentDirectory().toString(currentPresetFile.NoExtension);
		local name = currentPresetFile.toString(currentPresetFile.NoExtension);

		if (nameOnly)
			btnPresetBrowser.set("text", name);
		else
			btnPresetBrowser.set("text", category + " | " + name);
	}
	
	inline function savePreset()
	{
		local presetName = Engine.getCurrentUserPresetName();
		local isReadOnly = false;

		if (isDefined(currentPresetFile))
			isReadOnly = Engine.isUserPresetReadOnly(currentPresetFile);

		if (isDefined(presetName) && presetName != "" && !isReadOnly)
			overwriteCurrentPreset(presetName);
		else
			createNewPreset();
	}
	
	inline function overwriteCurrentPreset(presetName: string)
	{
		Engine.showYesNoWindow("Overwrite Preset", "Do you want to overwrite the current preset?", function[presetName](response)
		{
			if (response)
				Engine.saveUserPreset(presetName);
			else
				createNewPreset();
		});
	}
	
	inline function createNewPreset()
	{
		local userPresetsFolder = Expansions.getCurrentUserPresetsFolder();

		FileSystem.browse(userPresetsFolder, true, "*.preset", function[userPresetsFolder](f)
		{
			if (!isDefined(f) || !f.isFile())
				return;

			var grandparent = f.getParentDirectory().getParentDirectory().getParentDirectory();

			if (!userPresetsFolder.isSameFileAs(grandparent))
				return Engine.showMessageBox("Invalid Location", "Presets must be saved in a bank and category folder within the instrument's user presets folder.", 0);

			var isReadOnly = Engine.isUserPresetReadOnly(f);

			if (isReadOnly)
				return Engine.showMessageBox("Read Only", "The selected preset is read-only. Please create a new preset.", 0);

			Engine.saveUserPreset(f.toString(f.FullPath).replace(".preset"));

			currentPresetFile = f;
			updatePresetLabel(true);
		});
	}

	inline function setDataProperty(property: string, value: NotUndefined)
	{
		local data = fltPresetBrowser.get("Data").parseAsJSON();

		if (!isDefined(data[property]))
			return Console.print("!Property (" + property + ") does not exist - in Presets.setDataProperty()");

		data.Type = "PresetBrowser";
		data[property] = value;

		fltPresetBrowser.set("Data", trace(data));		
	}
	
	inline function setStyleDataProperties()
	{
		if (!isDefined(LookAndFeel.style))
			return;

		local style = LookAndFeel.style;

		if (!isDefined(style.presets.dataProperties) || typeof(style.presets.dataProperties) != "object")
			return;

		for (x in style.presets.dataProperties)
			setDataProperty(x, style.presets.dataProperties[x]);
	}
	
	//! Broadcasters
	const broadcasters = {};

	broadcasters.preLoad = Engine.createBroadcaster({id: "presetPreLoad", args: ["isInternal"], tags: ["preset browser"]});
	broadcasters.preLoad.setEnableQueue(true);

	broadcasters.postLoad = Engine.createBroadcaster({id: "presetPostLoad", args: ["isInternal"], tags: ["preset browser"]});
	broadcasters.postLoad.setEnableQueue(true);

	//! Function Calls
	setStyleDataProperties();

}
