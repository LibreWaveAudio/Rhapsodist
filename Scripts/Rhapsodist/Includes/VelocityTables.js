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

namespace VelocityTables
{
	//! tblVelocity
	const tblVelocity = Content.getAllComponents("tblVelocity\\d");

	for (x in tblVelocity)
	{
		if (isDefined(LookAndFeel.velocityTable))
			return x.setLocalLookAndFeel(LookAndFeel.velocityTable);

		x.setLocalLookAndFeel(CoreLookAndFeel.table);
	}

	//! Broadcasters
	const bctblVelocityReset = Engine.createBroadcaster({id: "tableClickWatcher", args: ["component", "event"]});
	
	bctblVelocityReset.attachToComponentMouseEvents(tblVelocity, "Clicks Only", "");
	bctblVelocityReset.addListener({}, "Alt click to reset.", function(component, event)
	{
		if (!event.altDown || !event.clicked || event.rightClick)
			return;

		component.reset();
	});
}
