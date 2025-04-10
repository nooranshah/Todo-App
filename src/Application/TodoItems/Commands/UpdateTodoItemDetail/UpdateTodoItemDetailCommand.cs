using MediatR;
using Microsoft.EntityFrameworkCore;
using Todo_App.Application.Common.Exceptions;
using Todo_App.Application.Common.Interfaces;
using Todo_App.Application.Tags.Queries;
using Todo_App.Domain.Entities;
using Todo_App.Domain.Enums;

namespace Todo_App.Application.TodoItems.Commands.UpdateTodoItemDetail;

public record UpdateTodoItemDetailCommand : IRequest
{
    public int Id { get; init; }

    public int ListId { get; init; }

    public PriorityLevel Priority { get; init; }

    public string? Note { get; init; }
    public string? Color { get; set; }
    public List<TagDto> Tags { get; set; } = new List<TagDto>();
}


public class UpdateTodoItemDetailCommandHandler : IRequestHandler<UpdateTodoItemDetailCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateTodoItemDetailCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(UpdateTodoItemDetailCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.TodoItems
            .Include(ti => ti.Tags) 
            .FirstOrDefaultAsync(ti => ti.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            throw new NotFoundException(nameof(TodoItem), request.Id);
        }

        entity.ListId = request.ListId;
        entity.Priority = request.Priority;
        entity.Note = request.Note;
        entity.Color = request.Color;

        
        var incomingTagNames = request.Tags.Select(t => t.Name).ToHashSet();
        var existingTags = entity.Tags.ToList();

        
        var tagsToRemove = existingTags.Where(t => !incomingTagNames.Contains(t.Name)).ToList();
        foreach (var tag in tagsToRemove)
        {
            entity.Tags.Remove(tag);
            _context.Tags.Remove(tag);  
        }

        
        var existingTagNames = existingTags.Select(t => t.Name).ToHashSet();
        foreach (var tagDto in request.Tags)
        {
            if (!existingTagNames.Contains(tagDto.Name))
            {
                var newTag = new Tag
                {
                    Name = tagDto.Name,
                    TodoItemId = entity.Id
                };
                entity.Tags.Add(newTag);
                _context.Tags.Add(newTag);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;  
    }
}