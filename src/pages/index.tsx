import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

import { api } from "@/utils/api";
import Todos from "@/component/Todos";
import CreateTodo from "@/component/CreateTodo";

export default function Home() {
  const { data: sessionData } = useSession();

  return (
    <>
      <Head>
        <title>Todo App</title>
        <meta name="description" content="Create todo app using the T3 stack" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          {sessionData ? (
            <div className="gird grid-col-1 gap-4 md:gap-8">
              <div className="flex flex-col gap-4 rounded-md bg-white/10 p-4 text-white">
                <h3 className="text-xl font-bold">Todos</h3>
                <Todos />
                <CreateTodo />
              </div>
          </div>
          ) : (null)}
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {sessionData && (
                  <span>Logged in as {sessionData.user?.email}</span>
                )}
              </p>
              <button
                className="rounded-full bg-blue-700 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
                onClick={
                  sessionData ? () => void signOut() : () => void signIn()
                }
              >
                {sessionData ? "Sign out" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

