// 2024
// License: Public Domain

/*
@description: Sets the velocity of note on messages to the specified value.
@usage: Place in a sampler or container's MIDI processor chain.
*/

const knbVelocity = Content.addKnob("Velocity", 0, 0);
knbVelocity.setRange(0, 127, 1);function onNoteOn()
{
	Message.setVelocity(knbVelocity.getValue());
}
 function onNoteOff()
{
	
}
 function onController()
{
	
}
 function onTimer()
{
	
}
 function onControl(number, value)
{
	
}
 