using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Todo_App.Application.Common.Interfaces;
using Todo_App.Application.TodoItems.Queries.GetTodoItemsWithPagination;

namespace Todo_App.Application.Tags.Queries;
public class GetTodoItemsByTagsQueryHandler : IRequestHandler<GetTodoItemsByTagsQuery, List<TodoItemBriefDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetTodoItemsByTagsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<TodoItemBriefDto>> Handle(GetTodoItemsByTagsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.TodoItems
            .Include(t => t.Tags)
            .AsQueryable();

        if (request.MatchAll)
        {
            query = query.Where(t => request.TagNames.All(tagName => t.Tags.Any(tag => tag.Name == tagName)));
        }
        else
        {
            query = query.Where(t => t.Tags.Any(tag => request.TagNames.Contains(tag.Name)));
        }

        return await query
            .ProjectTo<TodoItemBriefDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
