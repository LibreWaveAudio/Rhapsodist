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

namespace Footer
{
	//! pnlFooter
	const pnlFooter = Content.getComponent("pnlFooter");

	pnlFooter.setPaintRoutine(function(g)
	{
		if (isDefined(LookAndFeel.drawFooter))
			return LookAndFeel.drawFooter();

		var a = this.getLocalBounds(0);
		g.fillAll(this.get("bgColour"));
		
		if (isDefined(Style.useNoise) && Style.useNoise)
			g.addNoise({alpha: 0.03, scaleFactor: 1.5, area: a.toArray(), monochromatic: true});
	});
	
	//! fltPerformanceLabel
	const fltPerformanceLabel = Content.getComponent("fltPerformanceLabel");
	fltPerformanceLabel.set("y", isDefined(Style.footer.performanceLabelOffsetY) ? Style.footer.performanceLabelOffsetY : 0);
	
	//! pnlLogo
	const pnlLogo = Content.getComponent("pnlLogo");
	
	pnlLogo.setPaintRoutine(function(g)
	{
		if (isDefined(LookAndFeel.drawLogo))
			return LookAndFeel.drawLogo();
		
		var yOffset = isDefined(Style.footer.logoOffsetY) ? Style.footer.logoOffsetY : 0;
		
		var a = this.getLocalBounds(0).translated(0, yOffset);
		var company = Engine.getProjectInfo().Company;

		if (company == "Libre Wave")
			return drawLibreWaveLogo();

		g.setColour(this.get("textColour"));
		g.setFont("bold", 20);
		g.drawAlignedText(company.toUpperCase(), a, "centred");
	});

	//! Functions
	inline function drawLibreWaveLogo()
	{
		local pathData = "1080.t0F..d.QenqkCwF..d.QfWToCw1T0x.QfWToCw1T0x.QSlZnCwlenl.QSlZnCwlenl.QenqkCMVapTWCD8gtVNDapTWCDAdQkNDaX14CDAdQkNDaX14CD8gtVNzXsA30PPzG5Z4PrA30PPD3EU5PrAPjTPD3EU5PhUySVPD3EU5PT31EDAhriNDEtcAQtRSnCIFEtcAQnu0mCw+1VPzEn24PSdeEDkGhcNjXxkqEDsNFcNzlybAQ688lCs4LWPzTlo4Phs4LWPTnnf4P4xgED8gtVNTKoQAQenqkCMVaqFEFD8gtVNDaqFEFDAdQkNDapnmFDAdQkNDapnmFDAdVgNDaQ44FDAdVgNDaWUIGDAdQkNDajfvGDAdQkNDaC7XGDwVgfNjXfikGDEPneNzWH6AQF0fmC8ExdPzzju4Ph8ExdPTMXh4PJlZGD8gtVNjL1tAQenqkCMVaDY8GD8gtVNDaDY8GDAdQkNDa8JdIDAdQkNDa8JdID097gNDa25eHD097gNDa25eHDcjoeNDan2VIDcjoeNDan2VIDAFUbNDa25eHDAFUbNDa25eHDc.CZNDavfbIDc.CZNDavfbID8gtVNzXsonUlPDa+Z4Pr4qunPD3EU5Pr4SKpPD3EU5PrsNzqPjAgo4Pr4yasPD3EU5PrwF3tPD3EU5ProJRwPDa+Z4Prgg1uPDa+Z4PrE8LtPDXtH5PrwBhrPDa+Z4PrgYJqPDa+Z4PrgIfoPDXtH5Pr4O0mPDa+Z4Pi0VyXOCQr8qkCwFaoBCQfWToCwllZHCQfWToCwVP+JCQsNinCw1lKYCQsNinCw1TvaCQfWToCw1wtgCQfWToCwF.JUCQr8qkCMVaif9MDw1uVNDaherNDAdQkNDaOjCODAdQkNDaBCxODw1uVNDavHaODw1uVNDa8l3NDAlKhNDaVZVNDw1uVNzXsMYC.QDa+Z4PrMYC.QD3EU5PrA.fEQD3EU5PrA.fEQzWXK5Pr8WbAQzWXK5Pr8WbAQTaw74PrwH9DQTaw74PrwH9DQD6Cy4Pr8WbAQD6Cy4Pr8WbAQT6rj4PrABXEQT6rj4PrABXEQDa+Z4Pi0FHHRCQGbalCwlILWCQGC8mCwlw9LCQGC8mCMVaz0uDDcr8YNDalvDEDcr8YNjXLjKEDcr8YNDE9SAQktllCQg+TPD3pr4PhQg+TPzZuu4PLjKED0tabNjILQAQs6FmCwFc8KAQs6FmCMVapnmFDc.CZNDaxX6FDc.CZNjXlqEGDc.CZNje5xAQjBrlC4mtbPTqDv4Ph4mtbPjUS04PlqEGDk+AdNjL1tAQ4efmCwlJ5oAQ4efmCMVaz0uDDIoYeNDalvDEDIoYeNjXfiMED4MXeNTNyTAQ2B9mCkyLUPDkpB5PhkyLUPjWDF5PfiMEDwmChNjILQAQsjfnCwFc8KAQsjfnCMVY";
		local p = Content.createPath();
		p.loadFromData(pathData);

		g.setColour(this.get("textColour"));
		g.fillPath(p, a.withSizeKeepingCentre(102, 12));
	}
}
