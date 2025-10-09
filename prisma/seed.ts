import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  await prisma.review.deleteMany()
  await prisma.loan.deleteMany()
  await prisma.book_categories.deleteMany()
  await prisma.book_publishers.deleteMany()
  await prisma.book.deleteMany()
  await prisma.author.deleteMany()
  await prisma.categories.deleteMany()
  await prisma.publishers.deleteMany()
  await prisma.authUser.deleteMany()
  await prisma.user.deleteMany()
  const authors = await Promise.all([
    prisma.author.create({
      data: {
        author_id: 1,
        name_author: 'Guilherme Biondo',
        biography: 'Guilherme Biondo is a writer who started writing at a young age, driven by curiosity and a passion for storytelling. His books talk about people, feelings, and everything that is part of everyday life, but with a unique and sincere perspective.',
        photo: null,
      },
    }),
    prisma.author.create({
      data: {
        author_id: 2,
        name_author: 'Manoel Leite',
        biography: 'Manoel Leite is an author and keen observer of daily life. His stories arise from simple experiences, but full of meaning. With a direct and human writing style, Manoel aims to touch the reader with themes about memory, affection, and identity.',
        photo: null,
      },
    }),
  ])
  const categories = await Promise.all([
    prisma.categories.create({ data: { category_id: 1, name_category: 'Romance' } }),
    prisma.categories.create({ data: { category_id: 2, name_category: 'Chronicle' } }),
    prisma.categories.create({ data: { category_id: 3, name_category: 'Fiction' } }),
    prisma.categories.create({ data: { category_id: 4, name_category: 'Drama' } }),
  ])
  const publishers = await Promise.all([
    prisma.publishers.create({ data: { publish_id: 1, publish_name: 'Aurora Publishing' } }),
    prisma.publishers.create({ data: { publish_id: 2, publish_name: 'Books of Time' } }),
    prisma.publishers.create({ data: { publish_id: 3, publish_name: 'House of Letters' } }),
  ])
  const booksData = [
    { id: 1, author_id: 1, title: 'Life in Silence', description: 'A touching story about overcoming personal struggles through silence and introspection.' },
    { id: 2, author_id: 1, title: 'Fragments of Everyday Life', description: 'Short stories capturing the beauty and complexity of daily moments.' },
    { id: 3, author_id: 2, title: 'Stories of the Wind', description: 'Tales inspired by the ever-changing winds and the mysteries they carry.' },
    { id: 4, author_id: 2, title: 'Between Noise and Calm', description: 'A narrative exploring the balance between chaos and peace.' },
    { id: 5, author_id: 1, title: 'The Horizon and the Sea', description: 'An evocative journey of discovery along the endless horizon.' },
    { id: 6, author_id: 1, title: 'Winds of Change', description: 'Stories about transformation and the winds that guide us.' },
    { id: 7, author_id: 2, title: 'Paths of the Soul', description: 'A poetic exploration of the inner paths we all travel.' },
    { id: 8, author_id: 2, title: 'Under the Grey Sky', description: 'A dramatic tale set against a backdrop of uncertain skies.' },
    { id: 9, author_id: 1, title: 'Notes of a Silence', description: 'Reflections on moments of quiet and their powerful meanings.' },
    { id: 10, author_id: 2, title: 'The Last Letter', description: 'A heartfelt story revolving around a final farewell.' },
    { id: 11, author_id: 1, title: 'Between Words', description: 'Exploring what lies beyond spoken language and written text.' },
    { id: 12, author_id: 2, title: 'Colors of the City', description: 'A vivid portrayal of urban life through its vibrant colors.' },
    { id: 13, author_id: 1, title: 'The Weight of the Rain', description: 'A metaphorical story about burdens and relief brought by rain.' },
    { id: 14, author_id: 2, title: 'Blue Night', description: 'A mysterious journey through the darkness and light of the night.' },
    { id: 15, author_id: 1, title: 'Faces of Memory', description: 'Stories that capture the fleeting nature of memories.' },
    { id: 16, author_id: 2, title: 'Origin Tales', description: 'Exploring the roots and beginnings of our existence.' },
    { id: 17, author_id: 1, title: 'Echoes of Tomorrow', description: 'A futuristic narrative about hope and possibility.' },
    { id: 18, author_id: 2, title: 'The Garden of Words', description: 'A collection of poetic reflections on language and meaning.' },
    { id: 19, author_id: 1, title: 'Shadows and Light', description: 'A story about contrasts and the beauty found in duality.' },
    { id: 20, author_id: 2, title: 'The River of Time', description: 'An exploration of memory, time, and the flow of life.' },
  ]

  const books = await Promise.all(
    booksData.map(book =>
      prisma.book.create({
        data: {
          book_id: book.id,
          author_id: book.author_id,
          title: book.title,
          description: book.description,
          photo: null,
        },
      })
    )
  )
  const hashedPassword = await bcrypt.hash('123', 10)
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        user_id: 1,
        full_name: 'Kayky Brabo',
        birth_date: new Date('2005-01-30'),
        address: 'Rua das Flores, 123',
        email: 'kayky@gmail.com',
      },
    }),
    prisma.user.create({
      data: {
        user_id: 2,
        full_name: 'Kaue Brabo',
        birth_date: new Date('2010-01-12'),
        address: 'Av. Principal, 456',
        email: 'kaue@gmail.com',
      },
    }),
  ])
  const authUsers = await Promise.all([
    prisma.authUser.create({
      data: {
        id: 1,
        username: 'kayky@gmail.com',
        password: hashedPassword,
        role: 'admin',
        user_id: 1,
        favorite_book_id: null,
      },
    }),
    prisma.authUser.create({
      data: {
        id: 2,
        username: 'kaue@gmail.com',
        password: hashedPassword,
        role: 'user',
        user_id: 2,
        favorite_book_id: null,
      },
    }),
  ])
  const bookCategories = await Promise.all([
    prisma.book_categories.create({ data: { book_id: 1, category_id: 1 } }),
    prisma.book_categories.create({ data: { book_id: 2, category_id: 2 } }),
    prisma.book_categories.create({ data: { book_id: 3, category_id: 3 } }),
    prisma.book_categories.create({ data: { book_id: 4, category_id: 4 } }),
    prisma.book_categories.create({ data: { book_id: 5, category_id: 1 } }),
  ])
  const bookPublishers = await Promise.all([
    prisma.book_publishers.create({ data: { book_id: 1, publish_id: 1 } }),
    prisma.book_publishers.create({ data: { book_id: 2, publish_id: 2 } }),
    prisma.book_publishers.create({ data: { book_id: 3, publish_id: 3 } }),
    prisma.book_publishers.create({ data: { book_id: 4, publish_id: 1 } }),
    prisma.book_publishers.create({ data: { book_id: 5, publish_id: 2 } }),
  ])
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
