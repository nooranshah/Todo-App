import { Component, TemplateRef, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import {
  TodoListsClient, TodoItemsClient,
  TodoListDto, TodoItemDto, PriorityLevelDto,
  CreateTodoListCommand, UpdateTodoListCommand,
  CreateTodoItemCommand, UpdateTodoItemDetailCommand,
  TagDto
} from '../web-api-client';

@Component({
  selector: 'app-todo-component',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss']
})
export class TodoComponent implements OnInit {
  debug = false;
  deleting = false;
  deleteCountDown = 0;
  deleteCountDownInterval: any;
  lists: TodoListDto[] = [];
  priorityLevels: PriorityLevelDto[];

  selectedItem: TodoItemDto;
  newListEditor: any = {};
  listOptionsEditor: any = {};
  newListModalRef: BsModalRef;
  listOptionsModalRef: BsModalRef;
  deleteListModalRef: BsModalRef;
  itemDetailsModalRef: BsModalRef;
  public loading:boolean=false;
  itemDetailsFormGroup = this.fb.group({
    id: [null],
    listId: [null],
    priority: [''],
    note: [''],
    color:[''],
    tags: [[]]
  });

  public searchTerm:string;
  //#region new color 
  newItemColor: string = '#FFFFFF';
  //#endregion

  //#region filter by tag and title 
  selectedList: any = { id: 0, title: '', items: [] };
  filteredItems: TodoItemDto[] = [];
  //#endregion

  //#region short cut
  // New property to store tag usage counts
  tagUsage: { [key: string]: number } = {};
  // Store top tags for display
  topTags: string[] = [];
  //#endregion

  constructor(
    private listsClient: TodoListsClient,
    private itemsClient: TodoItemsClient,
    private modalService: BsModalService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.loadLists();
  }
  // Update tag usage whenever lists are loaded or modified
  updateTagUsage(): void {
    this.tagUsage = {};
    this.lists.forEach(list => {
      (list.items ?? []).forEach(item => {
        (item.tags ?? []).forEach(tag => {
          this.tagUsage[tag.name] = (this.tagUsage[tag.name] || 0) + 1;
        });
      });
    });

    // Calculate top 3 tags
    this.topTags = Object.entries(this.tagUsage)
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .slice(0, 3) // Take top 3
      .map(entry => entry[0]); // Get tag names
  }

  loadLists(): void {
    this.loading = true;
    this.listsClient.get().subscribe({
      next: result => {
        console.log('Lists response:', result);
        this.lists = result.lists ?? [];
        this.priorityLevels = result.priorityLevels ?? [];
        this.updateTagUsage();
        if (this.debug) {
          console.log('Loaded lists:', this.lists);
          console.log('Loaded priorityLevels:', this.priorityLevels);
        }

        if (this.lists.length) {
          this.selectList(this.lists[0]);
        } else {
          console.warn('No lists found, using fallback data');
       
          this.lists = [{
            id: 1,
            title: 'Fallback List',
            items: [] as TodoItemDto[] 
          } as TodoListDto];
          this.selectList(this.lists[0]);
        }
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load lists:', err);
        this.loading = false;
        this.lists = [{
          id: 1,
          title: 'Fallback List',
          items: [] as TodoItemDto[]
        } as TodoListDto];
        this.selectList(this.lists[0]);
      }
    });
  }

  // Add tag from shortcut
  applyTagShortcut(tagName: string): void {
    if (this.selectedItem) {
      const tagExists = this.selectedItem.tags?.some(tag => tag.name === tagName);
      if (!tagExists) {
        this.selectedItem.tags = this.selectedItem.tags || [];
        const newTag = new TagDto({ name: tagName });
        this.selectedItem.tags = [...this.selectedItem.tags, newTag];
        this.itemDetailsFormGroup.patchValue({ tags: this.selectedItem.tags });
        this.updateTagUsage(); // Update usage after adding tag
        this.updateItemDetails(); // Persist the change
      }
    }
  }


  showNewListModal(template: TemplateRef<any>): void {
    this.newListModalRef = this.modalService.show(template);
    setTimeout(() => document.getElementById('title').focus(), 250);
  }

  newListCancelled(): void {
    this.newListModalRef.hide();
    this.newListEditor = {};
  }

  addList(): void {
    this.filteredItems=[];
    const list = {
      id: 0,
      title: this.newListEditor.title,
      items: []
    } as TodoListDto;

    this.listsClient.create(list as CreateTodoListCommand).subscribe(
      result => {
        list.id = result;
        this.lists.push(list);
        this.selectedList = list;
        
        this.newListModalRef.hide();
        this.newListEditor = {};
      },
      error => {
        const errors = JSON.parse(error.response);

        if (errors && errors.Title) {
          this.newListEditor.error = errors.Title[0];
        }

        setTimeout(() => document.getElementById('title').focus(), 250);
      }
    );
  }

  showListOptionsModal(template: TemplateRef<any>) {
    this.listOptionsEditor = {
      id: this.selectedList.id,
      title: this.selectedList.title
    };

    this.listOptionsModalRef = this.modalService.show(template);
  }

  updateListOptions() {
    const list = this.listOptionsEditor as UpdateTodoListCommand;
    this.listsClient.update(this.selectedList.id, list).subscribe(
      () => {
        (this.selectedList.title = this.listOptionsEditor.title),
          this.listOptionsModalRef.hide();
        this.listOptionsEditor = {};
      },
      error => console.error(error)
    );
  }

  confirmDeleteList(template: TemplateRef<any>) {
    this.listOptionsModalRef.hide();
    this.deleteListModalRef = this.modalService.show(template);
  }

  deleteListConfirmed(): void {
    this.listsClient.delete(this.selectedList.id).subscribe(
      () => {
        this.deleteListModalRef.hide();
        this.lists = this.lists.filter(t => t.id !== this.selectedList.id);
        this.selectedList = this.lists.length ? this.lists[0] : null;
      },
      error => console.error(error)
    );
  }

  // Items
  showItemDetailsModal(template: TemplateRef<any>, item: TodoItemDto): void {
 
    this.selectedItem = item;
    this.itemDetailsFormGroup.patchValue({
      ...this.selectedItem,
      tags: this.selectedItem.tags || []  
    });

    this.itemDetailsModalRef = this.modalService.show(template);
    this.itemDetailsModalRef.onHidden.subscribe(() => {
        this.stopDeleteCountDown();
    });
  }

  selectList(list: TodoListDto): void {
    this.selectedList = list;
    this.selectedItem = null;
    this.searchTerm = '';
    this.filteredItems = [...(this.selectedList.items ?? [])];
    if (this.itemDetailsModalRef) {
      this.itemDetailsModalRef.hide();
    }
    if (this.debug) {
      console.log('Selected list:', this.selectedList);
      console.log('Filtered items:', this.filteredItems);
    }
  }

  remainingItems(list: TodoListDto): number {
    return (list.items ?? []).filter(t => !t.done).length;
  }

  updateItemDetails(): void {
    if (!this.selectedItem || !this.selectedItem.id) {
      console.error('Cannot update item: selectedItem is null or has no ID');
      return;
    }

    this.loading = true; 
    const formValue = this.itemDetailsFormGroup.value;
    const updatedItem = new UpdateTodoItemDetailCommand({
      id: this.selectedItem.id,
      listId: formValue.listId || this.selectedList.id,
      priority: formValue.priority || this.priorityLevels[0].value, 
      note: formValue.note || '',
      color: this.newItemColor,
      tags: this.selectedItem.tags || [] 
    });

    this.itemsClient.updateItemDetails(this.selectedItem.id, updatedItem).subscribe({
      next: () => {
        
        Object.assign(this.selectedItem!, {
          listId: updatedItem.listId,
          priority: updatedItem.priority,
          note: updatedItem.note,
          color: updatedItem.color,
          tags: updatedItem.tags 
        });

        
        if (this.selectedItem!.listId !== this.selectedList.id) {
          this.selectedList.items = (this.selectedList.items ?? []).filter(i => i.id !== this.selectedItem!.id);
          const targetList = this.lists.find(l => l.id === updatedItem.listId);
          if (targetList) {
            targetList.items = targetList.items || [];
            targetList.items.push(this.selectedItem!);
          }
        }

       
        this.filteredItems = this.filteredItems.map(i =>
          i.id === this.selectedItem!.id ? this.selectedItem! : i
        );
        this.itemDetailsModalRef.hide();
        this.itemDetailsFormGroup.reset();
        this.loading = false;
        this.updateTagUsage();
        this.filterItems(); 
      },
      error: err => {
        console.error('Failed to update item details:', err);
        this.loading = false;
        
      }
    });
  }
  addItem(): void {
  
    if (!this.priorityLevels.length || !this.selectedList.id) {
      console.error('Cannot add item: priorityLevels or selectedList not initialized');
      return;
    }

    const item: TodoItemDto = {
      id: 0,
      listId: this.selectedList.id,
      priority: this.priorityLevels[0].value,
      title: '', 
      done: false,
      color: this.newItemColor,
      tags: []
    }as TodoItemDto;

    
    this.selectedList.items = this.selectedList.items || [];
    this.selectedList.items.push(item);
    this.filteredItems = [...this.selectedList.items]; 
    const index = this.selectedList.items.length - 1;

    
    setTimeout(() => this.editItem(item, 'itemTitle' + index), 0);
  }

  editItem(item: TodoItemDto, inputId: string): void {
    this.selectedItem = item;
    setTimeout(() => {
      const input = document.getElementById(inputId) as HTMLInputElement;
      if (input) {
        input.focus();
      } else {
        console.warn(`Input with ID ${inputId} not found`);
      }
    }, 100); 
  }


  updateItem(item: TodoItemDto, pressedEnter: boolean = false): void {
    const isNewItem = item.id === 0;

    if (!item.title.trim()) {
      this.deleteItem(item);
      return;
    }
    if (item.id === 0) {
      this.itemsClient
        .create({
          ...item, listId: this.selectedList.id
        } as CreateTodoItemCommand)
        .subscribe(
          result => {
            item.id = result;
          },
          error => console.error(error)
        );
    } else {
      this.itemsClient.update(item.id, item).subscribe(
        () => console.log('Update succeeded.'),
        error => console.error(error)
      );
    }

    this.selectedItem = null;

    if (isNewItem && pressedEnter) {
      setTimeout(() => this.addItem(), 250);
    }
  }

  deleteItem(item: TodoItemDto, countDown?: boolean) {
    if (countDown) {
      if (this.deleting) {
        this.stopDeleteCountDown();
        return;
      }
      this.deleteCountDown = 3;
      this.deleting = true;
      this.deleteCountDownInterval = setInterval(() => {
        if (this.deleting && --this.deleteCountDown <= 0) {
          this.deleteItem(item, false);
        }
      }, 1000);
      return;
    }
    this.deleting = false;
    if (this.itemDetailsModalRef) {
      this.itemDetailsModalRef.hide();
    }

    if (item.id === 0) {
      const itemIndex = this.selectedList.items.indexOf(this.selectedItem);
      this.selectedList.items.splice(itemIndex, 1);
    } else {
      this.itemsClient.delete(item.id).subscribe(
        () =>{
          (this.selectedList.items = this.selectedList.items.filter(
            t => t.id !== item.id))
          this.filterItems();
        },
        error => console.error(error)
      );
    }
  }

 
  deleteTodoItem(item: TodoItemDto){
    this.loading=true;
    this.itemsClient.delete(item.id).subscribe(
      () =>{
        (this.selectedList.items = this.selectedList.items.filter(t => t.id !== item.id))
        this.loading=false;
        this.filterItems();
      },
      error => {
        console.error(error)
        this.loading=false;
      }
    );

  }

  stopDeleteCountDown() {
    clearInterval(this.deleteCountDownInterval);
    this.deleteCountDown = 0;
    this.deleting = false;
  }
  //event changing color 
  onColorChange(newColor: string): void {
    this.selectedItem.color = newColor;
    this.newItemColor= newColor;
  }

  addTag(event: Event): void {
    const input = event.target as HTMLInputElement;
    const tagName = input.value.trim();

    if (tagName && this.selectedItem) {
      const tagExists = this.selectedItem.tags?.some(tag => tag.name === tagName);
      if (!tagExists) {
        this.selectedItem.tags = this.selectedItem.tags || [];
        const newTag = new TagDto({ name: tagName });
        this.selectedItem.tags = [...this.selectedItem.tags, newTag];
        this.itemDetailsFormGroup.patchValue({ tags: this.selectedItem.tags });
        input.value = '';
        this.updateTagUsage();
      }
    }
  }

  removeTag(tagToRemove: TagDto): void {
    if (this.selectedItem) {
      this.selectedItem.tags = this.selectedItem.tags?.filter(tag => tag.name !== tagToRemove.name) || [];
      this.itemDetailsFormGroup.patchValue({ tags: this.selectedItem.tags });
      this.updateTagUsage();
    }
  }

filterItems(): void {
  const term = this.searchTerm.trim().toLowerCase();
  try {
    if (!term) {
      this.filteredItems = [...(this.selectedList.items ?? [])];
      return;
    }

    this.filteredItems = (this.selectedList.items ?? []).filter(item => {
      const titleMatch = item.title?.toLowerCase().includes(term) || false;
      const tagMatch = item.tags?.some(tag => tag.name?.toLowerCase().includes(term)) || false;
      return titleMatch || tagMatch;
    });
  } catch (error) {
    console.error('Error filtering items:', error);
    this.filteredItems = [...(this.selectedList.items ?? [])]; // Fallback
  }
}



}
