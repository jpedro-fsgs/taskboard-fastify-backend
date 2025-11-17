import { Task } from "@prisma/client/index-browser";

// Function to build a tree structure from a flat list of tasks
export function buildTree(tasks: Task[]){
    const taskMap = new Map<string, Task & { subTasks: Task[] }>();

    // Initialize the map with tasks and empty subTasks array
    tasks.forEach(task => {
        taskMap.set(task.id, { ...task, subTasks: [] });
    });

    const rootTasks: (Task & { subTasks: Task[] })[] = [];

    // Build the tree structure
    taskMap.forEach(task => {
        if (task.parentTaskId) {
            const parentTask = taskMap.get(task.parentTaskId);
            if (parentTask) {
                parentTask.subTasks.push(task);
            }
        } else {
            rootTasks.push(task);
        }
    });

    return rootTasks;

    
}