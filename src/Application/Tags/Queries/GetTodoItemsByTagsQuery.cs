using MediatR;
using Todo_App.Application.TodoItems.Queries.GetTodoItemsWithPagination;

namespace Todo_App.Application.Tags.Queries;
public class GetTodoItemsByTagsQuery : IRequest<List<TodoItemBriefDto>>
{
    public List<string> TagNames { get; set; } = new();

    // True tag should be equally (AND)
    // False one of tag equally (OR)
    public bool MatchAll { get; set; } = false;
}
