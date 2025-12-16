import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const getBookImageUrl = (title: string): string => {
  const slug = title.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  const specificMappings: { [key: string]: string } = {
    'fragments-of-everyday-life': 'book-interrupted-seasons',
  };
  
  const cloudinaryName = specificMappings[slug] || `book-${slug}`;
  return `https://res.cloudinary.com/ddfgsoh5g/image/upload/pedbook/books/${cloudinaryName}`;
}

const AUTHOR_IMAGES = {
  'Guilherme Biondo': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065250/pedbook/profiles/author-guilherme-biondo.jpg',
  'Manoel Leite': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065252/pedbook/profiles/author-manoel-leite.jpg',
}

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
        biography: 'Guilherme Biondo é um escritor que começou a escrever desde jovem, movido pela curiosidade e pela paixão por contar histórias. Seus livros falam sobre pessoas, sentimentos e tudo o que faz parte do cotidiano, mas com uma perspectiva única e sincera.',
        photo: AUTHOR_IMAGES['Guilherme Biondo'],
      },
    }),
    prisma.author.create({
      data: {
        author_id: 2,
        name_author: 'Manoel Leite',
        biography: 'Manoel Leite é um autor e observador atento da vida cotidiana. Suas histórias surgem de experiências simples, mas cheias de significado. Com um estilo de escrita direto e humano, Manoel busca tocar o leitor com temas sobre memória, afeto e identidade.',
        photo: AUTHOR_IMAGES['Manoel Leite'],
      },
    }),
  ])
  const categories = await Promise.all([
    prisma.categories.create({ data: { category_id: 1, name_category: 'Romance' } }),
    prisma.categories.create({ data: { category_id: 2, name_category: 'Crônica' } }),
    prisma.categories.create({ data: { category_id: 3, name_category: 'Ficção' } }),
    prisma.categories.create({ data: { category_id: 4, name_category: 'Drama' } }),
  ])
  const publishers = await Promise.all([
    prisma.publishers.create({ data: { publish_id: 1, publish_name: 'Editora Aurora' } }),
    prisma.publishers.create({ data: { publish_id: 2, publish_name: 'Livros do Tempo' } }),
    prisma.publishers.create({ data: { publish_id: 3, publish_name: 'Casa das Letras' } }),
  ])
  const booksData = [
    { id: 1, author_id: 1, title: 'Life in Silence', description: 'Uma narrativa profunda sobre a busca pela paz interior em meio ao caos urbano.' },
    { id: 2, author_id: 1, title: 'Fragments of Everyday Life', description: 'Pequenos momentos que compõem a grandeza da existência humana.' },
    { id: 3, author_id: 2, title: 'Stories of the Wind', description: 'Contos místicos que navegam entre realidade e fantasia.' },
    { id: 4, author_id: 2, title: 'Between Noise and Calm', description: 'Uma jornada filosófica sobre encontrar equilíbrio na vida moderna.' },
    { id: 5, author_id: 1, title: 'The Horizon and the Sea', description: 'Romance épico que explora os limites do amor e da aventura.' },
    { id: 6, author_id: 1, title: 'Winds of Change', description: 'Drama histórico sobre transformações sociais e pessoais.' },
    { id: 7, author_id: 2, title: 'Paths of the Soul', description: 'Reflexões espirituais sobre o propósito da vida.' },
    { id: 8, author_id: 2, title: 'Under the Grey Sky', description: 'Thriller psicológico ambientado em uma cidade sombria.' },
    { id: 9, author_id: 1, title: 'Notes of a Silence', description: 'Poesia em prosa sobre a beleza do silêncio.' },
    { id: 10, author_id: 2, title: 'The Last Letter', description: 'Mistério envolvente sobre segredos familiares.' },
    { id: 11, author_id: 1, title: 'Between Words', description: 'Explorando o não dito e os significados ocultos nas entrelinhas da comunicação.' },
    { id: 12, author_id: 2, title: 'Colors of the City', description: 'Um retrato vibrante da vida urbana através de suas múltiplas cores e nuances.' },
    { id: 13, author_id: 1, title: 'The Weight of the Rain', description: 'Metáfora poética sobre os fardos que carregamos e a renovação que vem das lágrimas.' },
    { id: 14, author_id: 2, title: 'Blue Night', description: 'Jornada misteriosa através da escuridão iluminada pela luz azulada da noite.' },
    { id: 15, author_id: 1, title: 'Faces of Memory', description: 'Histórias que capturam a natureza efêmera das lembranças e dos rostos que marcam nossas vidas.' },
    { id: 16, author_id: 2, title: 'Origin Tales', description: 'Explorando as raízes e os começos que moldam quem somos.' },
    { id: 17, author_id: 1, title: 'Fragments of Hope', description: 'Narrativa sobre esperança e possibilidades em tempos difíceis.' },
    { id: 18, author_id: 2, title: 'Trails and Scars', description: 'Coleção de reflexões sobre as marcas que a vida deixa em nós.' },
    { id: 19, author_id: 1, title: 'From the Other Side of the Street', description: 'História sobre perspectivas diferentes e a beleza da diversidade.' },
    { id: 20, author_id: 2, title: 'Interrupted Seasons', description: 'Exploração sobre mudanças inesperadas e adaptação na vida.' },
  ]

  const books = await Promise.all(
    booksData.map(book =>
      prisma.book.create({
        data: {
          book_id: book.id,
          author_id: book.author_id,
          title: book.title,
          description: book.description,
          photo: getBookImageUrl(book.title),
        },
      })
    )
  )
  const hashedPassword = await bcrypt.hash('123', 10)

  // Admin padrão
  const adminUser = await prisma.user.create({
    data: {
      user_id: 1,
      full_name: 'Kayky Brabo',
      birth_date: new Date('2005-01-30'),
      address: 'Rua Hermes da fonseca, 123',
      email: 'kayky@gmail.com',
    },
  })

  await prisma.authUser.create({
    data: {
      id: 1,
      username: 'kayky@gmail.com',
      password: hashedPassword,
      role: 'admin',
      user_id: adminUser.user_id,
      display_name: 'kayky',
    },
  });

  // Usuário comum padrão para testes (pode alugar e favoritar)
  const normalUser = await prisma.user.create({
    data: {
      full_name: 'Usuário Teste',
      birth_date: new Date('2000-01-01'),
      address: 'Endereço teste',
      email: 'user@gmail.com',
    },
  })

  await prisma.authUser.create({
    data: {
      username: 'user@gmail.com',
      password: hashedPassword,
      role: 'user',
      user_id: normalUser.user_id,
      display_name: 'user',
    },
  });
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
