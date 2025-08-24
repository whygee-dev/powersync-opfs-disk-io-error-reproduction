import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

const BATCH_SIZE = 10000;
const TOTAL_TODOS = 500000;
const TOTAL_TODO_LISTS = 50000;

const todoListNames = [
  'Work Projects',
  'Personal Tasks',
  'Home Improvement',
  'Health & Fitness',
  'Learning Goals',
  'Travel Plans',
  'Shopping List',
  'Bug Fixes',
  'Feature Development',
  'Team Meetings',
  'Client Work',
  'Research Tasks',
  'Marketing Ideas',
  'Financial Planning',
  'Creative Projects',
];

const sampleTitles = [
  'Complete project documentation',
  'Review code changes',
  'Update dependencies',
  'Fix bug in authentication',
  'Implement new feature',
  'Write unit tests',
  'Deploy to production',
  'Optimize database queries',
  'Refactor legacy code',
  'Setup monitoring',
  'Update user interface',
  'Configure CI/CD pipeline',
  'Review security audit',
  'Backup database',
  'Update API documentation',
];

const sampleDescriptions = [
  'This task requires immediate attention and should be completed by end of week.',
  'Low priority task that can be done when time permits.',
  'Critical bug fix needed for production stability.',
  'Enhancement request from customer feedback.',
  'Routine maintenance task.',
  null, // Some todos won't have descriptions
  'Important feature for next release.',
  'Technical debt that needs addressing.',
  'Performance improvement task.',
  'Security-related update required.',
];

const userIds = ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8'];

const colors = [
  '#3B82F6',
  '#EF4444',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#06B6D4',
  '#EC4899',
  '#84CC16',
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomPriority(): number {
  return Math.floor(Math.random() * 5) + 1; // 1-5
}

function getRandomBoolean(): boolean {
  return Math.random() < 0.3; // 30% chance of being completed
}

async function seedTodoLists() {
  console.log('Starting to seed todo lists...');

  const todoLists = Array.from({ length: TOTAL_TODO_LISTS }, (_, index) => ({
    name: `${getRandomItem(todoListNames)} #${index + 1}`,
    description: Math.random() < 0.7 ? getRandomItem(sampleDescriptions) : null,
    userId: getRandomItem(userIds),
    color: getRandomItem(colors),
  }));

  await prisma.todoList.createMany({
    data: todoLists,
  });

  console.log(`Successfully seeded ${TOTAL_TODO_LISTS} todo lists!`);
  return todoLists.map((_, index) => `${index + 1}`); // Return list of IDs for todos
}

async function seedTodos(todoListIds: string[]) {
  console.log('Starting to seed todos...');

  const batches = Math.ceil(TOTAL_TODOS / BATCH_SIZE);

  for (let batch = 0; batch < batches; batch++) {
    const batchStart = batch * BATCH_SIZE;
    const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL_TODOS);
    const batchSize = batchEnd - batchStart;

    const todos = Array.from({ length: batchSize }, (_, index) => ({
      title: `${getRandomItem(sampleTitles)} #${batchStart + index + 1}`,
      description: getRandomItem(sampleDescriptions),
      completed: getRandomBoolean(),
      userId: getRandomItem(userIds),
      priority: getRandomPriority(),
      todoListId: getRandomItem(todoListIds),
    }));

    await prisma.todo.createMany({
      data: todos,
    });

    console.log(`Seeded batch ${batch + 1}/${batches} (${batchEnd}/${TOTAL_TODOS} todos)`);
  }

  console.log(`Successfully seeded ${TOTAL_TODOS} todos!`);
}

async function main() {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.todo.deleteMany();
    await prisma.todoList.deleteMany();

    // Seed todo lists first
    await seedTodoLists();

    // Get actual todo list IDs from database
    const actualTodoLists = await prisma.todoList.findMany({ select: { id: true } });
    const actualIds = actualTodoLists.map(list => list.id);

    // Seed todos with actual list IDs
    await seedTodos(actualIds);

    // Print some stats
    const totalListCount = await prisma.todoList.count();
    const totalTodoCount = await prisma.todo.count();
    const completedTodoCount = await prisma.todo.count({ where: { completed: true } });
    const pendingTodoCount = totalTodoCount - completedTodoCount;

    console.log('\nSeeding completed!');
    console.log(`Total todo lists: ${totalListCount}`);
    console.log(`Total todos: ${totalTodoCount}`);
    console.log(`Completed todos: ${completedTodoCount}`);
    console.log(`Pending todos: ${pendingTodoCount}`);
    console.log(`Average todos per list: ${Math.round(totalTodoCount / totalListCount)}`);
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
