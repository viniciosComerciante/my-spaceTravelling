import { GetStaticProps } from 'next';
import { ReactNode } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
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
  const { results, next_page } = postsPagination;

  return (
    <>
      <div className={styles.logoContainer}>
        <img src="/images/Logo.svg" alt="logo" />
      </div>
      <div className={commonStyles.contentContainer}>
        {results &&
          results.map(result => (
            <Link href={`/post/${result.uid}`}>
              <a className={styles.articleInfos} key={result.uid} href="/post/">
                <h1>{result.data.title}</h1>
                <p>{result.data.subtitle}</p>
                <span>
                  <FiCalendar className={styles.calendarIcon} />
                  {format(
                    new Date(result.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </span>
                <span>
                  <FiUser className={styles.userIcon} />
                  {result.data.author}
                </span>
              </a>
            </Link>
          ))}

        {next_page && (
          <button type="button" className={styles.loadMore}>
            Carregar mais posts
          </button>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', { pageSize: 5 });
  const { results, next_page } = postsResponse;

  // console.log(results);

  return {
    props: {
      postsPagination: {
        next_page,
        results,
      },
    },
    revalidate: 1,
  };
};
