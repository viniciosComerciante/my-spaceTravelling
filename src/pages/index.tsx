import { GetStaticProps } from 'next';
import { ReactNode, useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { Footer } from '../components/Footer';

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
  const [results, setResults] = useState(postsPagination.results);
  const [next_page, setNext_page] = useState(postsPagination.next_page);

  async function getMorePosts(): Promise<void> {
    if (!next_page) return;
    const posts = await fetch(next_page);
    const postsJson = await posts.json();
    const newResults = postsJson.results;

    setResults([...results, ...newResults]);
    setNext_page(postsJson.next_page);
  }

  return (
    <>
      <div className={styles.logoContainer}>
        <img src="/images/Logo.svg" alt="logo" />
      </div>
      <div className={commonStyles.contentContainer}>
        {results &&
          results.map(result => (
            <Link href={`/post/${result.uid}`} key={result.uid}>
              <a className={styles.articleInfos} href="/post/">
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
          <button
            type="button"
            onClick={getMorePosts}
            className={styles.loadMore}
          >
            Carregar mais posts
          </button>
        )}
        <Footer />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', { pageSize: 5 });
  const { results, next_page } = postsResponse;

  return {
    props: {
      postsPagination: {
        next_page,
        results,
      },
    },
    revalidate: 60 * 60 * 24,
  };
};
