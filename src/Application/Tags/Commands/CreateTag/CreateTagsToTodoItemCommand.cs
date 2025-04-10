using MediatR;
using Todo_App.Application.Common.Interfaces;
using Todo_App.Domain.Entities;
using Todo_App.Domain.Events;

namespace Todo_App.Application.Tags.Commands.CreateTag;
public class CreateTagsToTodoItemCommand:IRequest<int>
{
    public int TodoItemId { get; init; } 
    public string? TagNames { get; init; } 

    public class CreateTagsToTodoItemCommandHandler : IRequestHandler<CreateTagsToTodoItemCommand, int>
    {
        private readonly IApplicationDbContext _context;

        public CreateTagsToTodoItemCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<int> Handle(CreateTagsToTodoItemCommand request, CancellationToken cancellationToken)
        {

            var entity = new Tag
            {
                TodoItemId = request.TodoItemId,
                Name = request.TagNames

            };

             entity.AddDomainEvent(new TagCreatedEvent(entity));

            _context.Tags.Add(entity);

            await _context.SaveChangesAsync(cancellationToken);

            return entity.Id;
        }
    }
}
