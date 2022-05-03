import { GetStaticPaths, GetStaticProps } from 'next';
import { ReactNode } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): ReactNode {
  const { data, first_publication_date } = post;

  return (
    <>
      <div className={styles.headerContainer}>
        <img src="/images/Logo.svg" alt="logo" />
      </div>
      <div className={styles.banner}>
        <img src={data.banner.url} alt="banner" />
      </div>
      <article className={commonStyles.contentContainer}>
        <h1>{data.title}</h1>
        <div className={styles.postInfo}>
          <span>
            {format(new Date(first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </span>
          <span>{data.author}</span>
          <span>Tempo de leitura</span>
        </div>
        {data.content &&
          data.content.map((content, index) => (
            <section key={index}>
              <h2>{content.heading}</h2>
            </section>
          ))}
      </article>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const { results } = posts;

  const paths = results.map(post => {
    return { params: { slug: post.uid } };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  let { slug } = params;
  slug = slug.toString();

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', slug);

  const { first_publication_date, data } = response;

  return {
    props: {
      post: { first_publication_date, data },
    },
    revalidate: 60 * 60 * 24,
  };
};
