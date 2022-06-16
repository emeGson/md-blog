import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import ContentEditable from "react-contenteditable";
import markdown_it from "markdown-it";
import { HtmlRenderer, Parser } from "commonmark";
import fs from "fs";

interface Tests {
  tests: Test[];
}

interface Test {
  md: string;
  html: string;
  res: string;
}

export const getServerSideProps: GetServerSideProps<Tests> = async () => {
  const files = fs.readdirSync("./tests");

  const tests: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const s = files[i].split(".");

    if (s.length >= 2 && s[1] == "md") {
      tests.push(s[0]);
    }
  }

  console.log(tests.length);

  const res: Tests = { tests: [] };

  const parser = new Parser({ smart: true, time: true });
  const renderer = new HtmlRenderer({});

  tests.forEach((t) => {
    const md = fs.readFileSync(`./tests/${t}.md`, { encoding: "utf-8" });
    const html = fs.readFileSync(`./tests/${t}.out`, { encoding: "utf8" });
    const r = renderer.render(parser.parse(md));
    res.tests.push({ md: md, html: html.trim(), res: r.trim() });
  });

  return { props: res };
};

const Home: NextPage<Tests> = (props: Tests) => {
  const [text, setText] = useState("");
  const [html, setHtml] = useState("");

  const parseText = (text: string) => {
    const reader = new Parser({ smart: true, time: true });
    const reptext = text.replaceAll(/<.*?>/g, "");
    console.log("🚀 ~ file: index.tsx ~ line 57 ~ parseText ~ reptext", reptext)
    const md = reader.parse(reptext);
    //console.log("🚀 ~ file: index.tsx ~ line 23 ~ parseText ~ md", md);
    const writer = new HtmlRenderer({});
    const html = writer.render(md);
    //console.log("🚀 ~ file: index.tsx ~ line 26 ~ parseText ~ html", html);

    setHtml(html);
    setText(text);
  };

  return (
    <div className="bg-gray-200  w-screen flex flex-row">
      <Head>
        <title>Markdown driven blog writer</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="grid grid-cols-3 w-full gap-4">
        <ContentEditable
          className=" bg-gray-700 outline-none text-gray-400"
          html={text}
          onChange={(newtext) => {
            parseText(newtext.target.value);
          }}
          onKeyDown={(ev) => {
            console.log("hello")
            console.log(ev)
          }}
        />
        <pre className=" bg-gray-800 text-gray-400">{html}</pre>
        <ContentEditable
          className=" bg-gray-600 outline-none text-gray-400"
          html={html}
          disabled={true}
          onChange={(_) => {}}
        />
        {props.tests.map((test) => {
          return (
            <>
              <pre>{test.md}</pre>
              <pre
                className={
                  test.res == test.html ? "bg-green-300" : "bg-red-300"
                }
              >
                {test.res}
              </pre>
              <pre>{test.html}</pre>
              <div className="col-span-3 h-12"></div>
            </>
          );
        })}
      </div>
    </div>
  );
};

export default Home;