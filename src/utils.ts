import { Task } from "@prisma/client/index-browser";

// Function to build a tree structure from a flat list of tasks
export function buildTree(tasks: Task[]): (Task & { sub_tasks: Task[] })[] {
    const taskMap = new Map<string, Task & { sub_tasks: Task[] }>();

    // Initialize the map with tasks and empty sub_tasks array
    tasks.forEach((task) => {
        taskMap.set(task.id, { ...task, sub_tasks: [] });
    });

    const rootTasks: (Task & { sub_tasks: Task[] })[] = [];

    // Build the tree structure
    taskMap.forEach((task) => {
        if (task.parent_task_id) {
            const parentTask = taskMap.get(task.parent_task_id);
            if (parentTask) {
                parentTask.sub_tasks.push(task);
            }
        } else {
            rootTasks.push(task);
        }
    });
    console.log("Built task tree:", rootTasks);
    return rootTasks;
}