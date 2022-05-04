import { GetStaticPaths, GetStaticProps } from 'next';
import { ReactNode } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PrismicDom from 'prismic-dom';
import { FiClock, FiUser, FiCalendar } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
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

export default function Post({ post }: PostProps): ReactNode | null {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <p
        style={{
          position: 'absolute',
          top: '50%',
          bottom: '50%',
          left: '50%',
          right: '50%',
        }}
      >
        Carregando...
      </p>
    );
  }

  const { data } = post;
  const { first_publication_date } = post;

  function timeToRead(content): number {
    const words = content
      .map(item => {
        return RichText.asText(item.body).split(' ');
      })
      .reduce((acc, curr) => [...curr, ...acc], [])
      .filter(i => i !== '');
    const time = Math.ceil(words.length / 200);

    return time;
  }

  return (
    <>
      <Header />
      <div className={styles.banner}>
        <img src={data.banner.url} alt="banner" />
      </div>
      <article className={commonStyles.contentContainer}>
        <h1 className={styles.title}>{data.title}</h1>
        <div className={styles.postInfo}>
          <span>
            <FiCalendar />
            {format(new Date(first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </span>
          <span>
            <FiUser />
            {data.author}
          </span>
          <span>
            <FiClock />
            {timeToRead(data.content)} min
          </span>
        </div>
        {data.content &&
          data.content.map(content => {
            return (
              <section
                className={styles.bodySection}
                key={content.body.length * Math.random()}
              >
                <h2>{content.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: PrismicDom.RichText.asHtml(content.body),
                  }}
                />
              </section>
            );
          })}
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
  const slug = params.slug as string;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', slug);

  const { first_publication_date, data } = response;

  const post: Post = {
    first_publication_date,
    data: {
      title: data.title,
      subtitle: data.subtitle,
      banner: {
        url: data?.banner?.url,
      },
      author: data?.author,
      content: data?.content,
    },
    uid: response.uid,
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 24,
  };
};
