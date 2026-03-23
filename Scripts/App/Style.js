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

namespace Style
{
	const alertWindow = {
		bgColour: 0xff313243,
		itemColour: 0xff181825,
		itemColour2: 0x55cdd6f4,
		itemColour3: 0xff11111b,
		textColour: 0xffcdd6f4,
		borderSize: 1,
		borderRadius: 5,
		labelRadius: 1,
		font: "regular",
		fontSize: 20,
		titleFont: "medium",
		titleFontSize: 18,
		buttonFont: "medium",
		buttonFontSize: 16,
		buttonRadius: 2
	};

	const inputBox = {
		font: "medium",
		fontSize: 14,
		borderRadius: 2,
		borderSize: 0
	};

	const popupMenu = {
		font: "medium",
		fontSize: 16,
		borderSize: 1,
		borderRadius: 5,
		itemRadius: 5,
		bgColour: 0xff181825,
		itemColour: 0xffb8c1dc,
		itemColour2: 0x33b8c1dc,
		textColour: 0xffb8c1dc
	};
	
	const presets = {
		displayFont: "medium",
		displayFontSize: 16,
		displayTextOffsetY: -0.5,
		columnBorderRadius: 5,
		columnBorderSize: 1,
		scrollbarRadius: 2,
		searchBarBorder: 1,
		searchBarRadius: 2,
		itemBgColour: 0x0,
		itemHoverColour: 0xff323344,
		itemRadius: 5,
		itemTextOffsetY: -3,
		expansionFont: "medium",
		expansionFontSize: 16,
		expansionBgColour: 0x88323344,
		expansionHoverColour: 0xff434455
	};

	const userSettings = {
		font: "default",
		fontSize: 16,	
		titleFont: "semibold",
		titleFontSize: 18,	
		menuFont: "medium",
		menuFontSize: 16,
		scrollbarRadius: 2
	}
	
	const header = {
		font: "bold",
		fontSize: 24,
		textHeightOffset: 0,
		sliderFont: "medium",
		sliderFontSize: 12
	}
	
	const keyboard = {
		radius: 3,
		roundEndKeys: true,
		shadow: false,
		whiteHover: 0xffcdd6f4,
		whiteDown: 0xff595d6e,
		blackHover: 0xff313244,
		blackDown: 0xff595d6e
	};
	
	Content.setValuePopupData({
	    "fontName":"medium",
	    "fontSize": 18,
	    "borderSize": 2,
	    "borderRadius": 5,
	    "margin": 8,
	    "bgColour": 0x559399B1,
	    "itemColour": 0xff1A1A26,
	    "itemColour2": 0xff1A1A26,
	    "textColour": 0xffcdd6f4
	});
	
	const useNoise = true;
}
