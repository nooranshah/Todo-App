using Microsoft.AspNetCore.Mvc;
using Todo_App.Application.Tags.Commands.CreateTag;
using Todo_App.Application.Tags.Commands.DeleteTag;

namespace Todo_App.WebUI.Controllers;
public class TagController : ApiControllerBase
{
    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateTagsToTodoItemCommand command)
    {
        return await Mediator.Send(command);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        await Mediator.Send(new DeleteTagCommand(id));

        return NoContent();
    }
}
