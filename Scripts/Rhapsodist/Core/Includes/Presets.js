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
	reg favouriteButtonState = false;
	reg currentPresetFile;
	reg isInternal = true;
		
	//! User Preset Handler
	const uph = Engine.createUserPresetHandler();

	uph.setPreCallback(function(presetData)
	{
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
		
		if (isDefined(Style.useNoise) && Style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a.toArray(), monochromatic: true});
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
		g.setColour(Colours.withMultipliedBrightness(obj.textColour, obj.over ? 1.0 - 0.2 * obj.down : 0.8));
		g.drawAlignedText(obj.value ? "\ue13c" : "\ue136", [a[0] + 7, a[1], a[2], a[3]], "left");

		var font = isDefined(Style.presets.displayFont) ? Style.presets.displayFont : "medium";
		var fontSize = isDefined(Style.presets.displayFontSize) ? Style.presets.displayFontSize : 16;
		var textOffsetY = isDefined(Style.presets.displayTextOffsetY) ? Style.presets.displayTextOffsetY : -0.5;

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

		g.setColour(this.get("bgColour"));
		g.fillRoundedRectangle(a, radius);

		if (isDefined(Style.useNoise) && Style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a.toArray(), monochromatic: true});

		g.setColour(this.get("itemColour"));
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
		if (isDefined(LookAndFeel.drawPresetBrowserBackground))
			return LookAndFeel.drawPresetBrowserBackground();

		var a = obj.area;

		g.setColour(obj.bgColour);
		g.fillRect(a);
		
		if (isDefined(Style.useNoise) && Style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a.toArray(), monochromatic: true});
	});
			
	laffltPresetBrowser.registerFunction("drawPresetBrowserColumnBackground", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawPresetBrowserColumnBackground))
			return LookAndFeel.drawPresetBrowserColumnBackground();

		var a = obj.area;
		var radius = isDefined(Style.presets.columnBorderRadius) ? Style.presets.columnBorderRadius : 0;
		var borderSize = isDefined(Style.presets.columnBorderSize) ? Style.presets.columnBorderSize : 0;
		var font = isDefined(Style.presets.columnFont) ? Style.presets.columnFont : "medium";
		var fontSize = isDefined(Style.presets.columnFontSize) ? Style.presets.columnFontSize : 18;

		if (obj.text == "Add a Bank" || obj.text == "Select a Nothing")
			obj.text = "Select a Library";

		if (obj.text == "Select a Column")
	    	obj.text = "Select a Category";

		if (a[2] > 400 && obj.text != "" && !favouriteButtonState)
			obj.text = "No Results";

		g.setColour(obj.itemColour);
		g.fillRoundedRectangle(a, radius);

		g.setColour(obj.textColour);
		g.setFont(font, fontSize + 2);
		g.drawAlignedText(obj.text, [a[0], a[1] - 10, a[2], a[3]], "centred");

		g.setColour(obj.itemColour2);

		if (borderSize)
			g.drawRoundedRectangle(a.reduced(borderSize / 2), radius, 1);

		if (isDefined(Style.useNoise) && Style.useNoise)
			g.addNoise({alpha: 0.025, scaleFactor: 1.5, area: a.toArray(), monochromatic: true});
	});

	laffltPresetBrowser.registerFunction("drawPresetBrowserListItem", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawPresetBrowserListItem))
			return LookAndFeel.drawPresetBrowserListItem();

	    var a = obj.area.reduced(3, 1);
		var font = isDefined(Style.presets.itemFont) ? Style.presets.itemFont : "medium";
		var fontSize = isDefined(Style.presets.itemFontSize) ? Style.presets.itemFontSize : 14;
		var textOffsetY = isDefined(Style.presets.itemTextOffsetY) ? Style.presets.itemTextOffsetY : -3;
		var radius = isDefined(Style.presets.itemRadius) ? Style.presets.itemRadius : 5;
		var bgColour = isDefined(Style.presets.itemBgColour) ? Style.presets.itemBgColour : 0x0;
		var hoverColour = isDefined(Style.presets.itemHoverColour) ? Style.presets.itemHoverColour : 0xff323344;
		var textColour = obj.textColour;

		if (obj.columnIndex == -1)
			return drawExpansionColumnListItem();

		if (isDefined(bgColour))
		{
			g.setColour(bgColour);
			g.fillRoundedRectangle(a, radius);
		}

		g.setColour(Colours.withMultipliedAlpha(hoverColour, obj.hover && !obj.selected ? 0.6 : 1.0));

		if (obj.selected || obj.hover)
			g.fillRoundedRectangle(a, radius);

		g.setColour(textColour);

		if (obj.selected)
			g.fillRoundedRectangle(a.withWidth(5), {CornerSize: radius, Rounded:[1, 0, 1, 0]});

		g.setFont(font, fontSize);
		g.setColour(Colours.withMultipliedBrightness(textColour, obj.hover || obj.selected ? 1.0 : 0.8));

		g.drawFittedText(obj.text.replace(".preset"), [a[0] + 12 + (22 * (obj.columnIndex == 2)), a[1] + textOffsetY, a[2] - 16, a[3]], "left", 1, 1.0);
		
	});
	
	inline function drawExpansionColumnListItem()
	{
		var a = obj.area.reduced(3, 3);

		g.setColour(Style.presets.expansionBgColour);
		g.fillRoundedRectangle(a, radius);
		
		g.setColour(Colours.withAlpha(Style.presets.expansionHoverColour, obj.hover && !obj.selected ? 0.7 : 1.0));
		
		if (obj.selected || obj.hover)
			g.fillRoundedRectangle(a, radius);

		g.setColour(Colours.white);
		g.drawImage(obj.text, [a[0] + 5, a[1] + a[3] / 2 - 40 / 2, 40, 40], 0, 0);

		g.setFont(Style.presets.expansionFont, Style.presets.expansionFontSize);
		g.setColour(Colours.withMultipliedBrightness(textColour, obj.hover || obj.selected ? 1.0 : 0.8));
		g.drawFittedText(obj.text, a.reduced(0, 5).translated(56).withWidth(a[2] - 80), "left", 3, 1.0);
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
		local a = obj.area;
		local editButtons = ["Add", "Rename", "Delete"];
		local editIcons = ["\ue3d4", "\ue3b4", "\ue4a8"];

		g.setFont("phosphor", 22);
		g.setColour(Colours.withMultipliedBrightness(fltPresetBrowser.get("textColour"), obj.over ? 1.0 - 0.2 * obj.down : 0.8));

		if (editButtons.contains(obj.text))
			return g.drawAlignedText(editIcons[editButtons.indexOf(obj.text)], a, "centred");
		
		if (obj.text != "More")
			return;

		g.setFont("phosphor", 28);
		g.drawAlignedText("\ue1fe", a, "centred");
	}
	
	laffltPresetBrowser.registerFunction("drawPresetBrowserSearchBar", function(g, obj)
	{
		var a = obj.area;
		var wh = a[3] / 2.0;
		var border = Style.presets.searchBarBorder;
		var radius = Style.presets.searchBarRadius;

		g.setColour(obj.itemColour3);
		g.fillRoundedRectangle([a[0] + 20, a[1], a[2] - 20, a[3]], radius);

		g.setColour(Colours.withAlpha(Colours.black, 0.5));
		g.drawRoundedRectangle([a[0] + 20 + border / 2, a[1] + border / 2, a[2] - border - 20, a[3] - border], radius, border);

		if (isDefined(Style.useNoise) && Style.useNoise)
			g.addNoise({alpha: 0.02, scaleFactor: 1.5, area: a.toArray(), monochromatic: true});

		g.setFont("phosphor", 18);
		g.setColour(Colours.withAlpha(fltPresetBrowser.get("textColour"), 0.8));
		g.drawAlignedText("\ue30c", [a[0], a[1], a[2] - 5, a[3]], "right");
	});

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
		CoreLookAndFeel.drawPopupMenuBackground({});
	});

	laffltPresetBrowser.registerFunction("drawPopupMenuItem", function(g, obj)
	{
		var text = obj.text.toLowerCase();
		var icon = "";

		if (text.contains("import") && text.contains("clipboard"))
			icon = "\ue196";
		else if (text.contains("import") && text.contains("collection"))
			icon = "\ue61e";
		else if (text.contains("export") && text.contains("clipboard"))
			icon = "\ue1ca";
		else if (text.contains("export") && text.contains("collection"))
			icon = "\ue232";
		else
			icon = "\ue256";
			
		obj.text = obj.text.replace("all ");
			
		CoreLookAndFeel.drawPopupMenuItem({icon: icon});
	});

	laffltPresetBrowser.registerFunction("getIdealPopupMenuItemSize", function(obj)
	{
		return CoreLookAndFeel.getIdealPopupMenuItemSize();
	});

	laffltPresetBrowser.registerFunction("drawScrollbar", function(g, obj)
	{
		if (isDefined(LookAndFeel.drawPresetBrowserScrollbar))
			return LookAndFeel.drawPresetBrowserScrollbar();

		var properties = {
			bgColour: Colours.withMultipliedBrightness(obj.itemColour1, 0.5),
			itemColour: obj.textColour,
			radius: Style.presets.scrollbarRadius
		};

		CoreLookAndFeel.drawScrollbar(properties);
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

		if (!isDefined(userPresetsFolder))
			return;

		FileSystem.browse(userPresetsFolder, true, "*.preset", function[userPresetsFolder](f)
		{
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

	inline function loadExpansionImages()
	{
		local images = Expansions.getAllExpansionIcons();

		for (x in images)
			laffltPresetBrowser.loadImage(x[1], x[0]);
	}
	
	//! Broadcasters
	const broadcasters = {};

	broadcasters.preLoad = Engine.createBroadcaster({id: "presetPreLoad", args: ["isInternal"], tags: ["preset browser"]});
	broadcasters.preLoad.setEnableQueue(true);

	broadcasters.postLoad = Engine.createBroadcaster({id: "presetPostLoad", args: ["isInternal"], tags: ["preset browser"]});
	broadcasters.postLoad.setEnableQueue(true);
	
	//! Function Calls
	loadExpansionImages();

	if (isDefined(Style.presets.numColumns))
		setDataProperty("NumColumns", Style.presets.numColumns);
}
