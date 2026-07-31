// License: Public Domain

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
 