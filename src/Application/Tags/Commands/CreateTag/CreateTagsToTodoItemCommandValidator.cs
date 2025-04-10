using FluentValidation;

namespace Todo_App.Application.Tags.Commands.CreateTag;
public  class CreateTagsToTodoItemCommandValidator : AbstractValidator<CreateTagsToTodoItemCommand>
{
    public CreateTagsToTodoItemCommandValidator()
    {
        RuleFor(v => v.TagNames)
            .MaximumLength(50)
            .NotEmpty();
    }
}
