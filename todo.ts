type Todo = {
  id: number;
  text: string;
  done: boolean;
};

const FILE_PATH = 'todos.json';
const fs = require('node:fs') as typeof import('node:fs');

const readTodos = (): Todo[] => {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      return [];
    }
    const text = fs.readFileSync(FILE_PATH, 'utf8');
    if (text.trim().length === 0) {
      return [];
    }
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item): item is Todo =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { id?: unknown }).id === 'number' &&
        typeof (item as { text?: unknown }).text === 'string' &&
        typeof (item as { done?: unknown }).done === 'boolean'
    );
  } catch {
    return [];
  }
};

const writeTodos = (todos: Todo[]): void => {
  fs.writeFileSync(FILE_PATH, `${JSON.stringify(todos, null, 2)}\n`, 'utf8');
};

const usage = (): void => {
  console.log('Usage:');
  console.log('  npx ts-node todo.ts add "Todo text"');
  console.log('  npx ts-node todo.ts list');
  console.log('  npx ts-node todo.ts done <id>');
};

const args = process.argv.slice(2);
const command = args[0];

if (command === 'add') {
  const text = args.slice(1).join(' ').trim();
  if (!text) {
    usage();
    process.exit(1);
  }
  const todos = readTodos();
  const nextId =
    todos.length === 0 ? 1 : Math.max(...todos.map((todo) => todo.id)) + 1;
  const todo: Todo = { id: nextId, text, done: false };
  todos.push(todo);
  writeTodos(todos);
  console.log(`✓ Added: "${todo.text}" (id: ${todo.id})`);
} else if (command === 'list') {
  const todos = readTodos();
  if (todos.length === 0) {
    console.log('No todos yet.');
    process.exit(0);
  }
  todos.forEach((todo) => {
    const mark = todo.done ? 'x' : ' ';
    console.log(`${todo.id}. [${mark}] ${todo.text}`);
  });
} else if (command === 'done') {
  const id = Number(args[1]);
  if (!Number.isInteger(id) || id <= 0) {
    usage();
    process.exit(1);
  }
  const todos = readTodos();
  const todo = todos.find((item) => item.id === id);
  if (!todo) {
    console.log(`Todo with id ${id} not found.`);
    process.exit(1);
  }
  todo.done = true;
  writeTodos(todos);
  console.log(`✓ Completed: "${todo.text}"`);
} else {
  usage();
  process.exit(1);
}
