import { GetStaticProps } from 'next';
import { ReactNode } from 'react';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): ReactNode {
  return (
    <>
      <div className={styles.contentContainer}>
        <article>
          <h1>Como utilizar webhooks</h1>
          <p>pensando em sincronização ao invés de ciclos de vida.</p>
          <span>15 Mar 2022</span>
          <span>Vinícios Oliveira</span>
        </article>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts');
  const { results, next_page } = postsResponse;

  return {
    props: {
      next_page,
      results,
    },
    revalidate: 24 * 60 * 60,
  };
};
