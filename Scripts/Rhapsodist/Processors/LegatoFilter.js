// 2024
// License: Public Domain

/*
@description: Blocks or only allows legato notes.
@usage: Place in a sampler's MIDI Processor chain.
@note: Haven't used this one in a while so might need some refinement.
*/

//! btnBlock
const btnBlock = Content.addButton("Block", 10, 10);
btnBlock.set("tooltip", "Enabled: legato notes blocked. Disabled: only legato notes allowed.")function onNoteOn()
{
	if (btnBlock.getValue() && Synth.isLegatoInterval())
		return Message.ignoreEvent(true);

	if (!btnBlock.getValue() && !Synth.isLegatoInterval())
		Message.ignoreEvent(true);
}
 function onNoteOff()
{
	if (btnBlock.getValue() && Synth.isLegatoInterval())
		return Message.ignoreEvent(true);

	if (!btnBlock.getValue() && !Synth.isLegatoInterval())
		Message.ignoreEvent(true);
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
 