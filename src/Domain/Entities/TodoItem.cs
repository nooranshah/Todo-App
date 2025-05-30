﻿using System.ComponentModel.DataAnnotations;

namespace Todo_App.Domain.Entities;

public class TodoItem : BaseAuditableEntity
{
    public int ListId { get; set; }

    public string? Title { get; set; }
    public string? Note { get; set; }

    public PriorityLevel Priority { get; set; }

    public DateTime? Reminder { get; set; }

    public string? Color { get; set; }

    private bool _done;
    public bool Done
    {
        get => _done;
        set
        {
            if (value == true && _done == false)
            {
                AddDomainEvent(new TodoItemCompletedEvent(this));
            }

            _done = value;
        }
    }
    public TodoList List { get; set; } = null!;
    public IList<Tag> Tags { get; private set; } = new List<Tag>();
}
