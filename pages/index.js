import Head from "next/head";
import Image from "next/image";
import styled from "styled-components";
import HomeBody from "../components/HomeBody/HomeBody";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Home Page</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HomeContainer>
        <Navbar />
        <HomeBody />
      </HomeContainer>
    </div>
  );
}

const HomeContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  height: auto;
  /* background-color: green; */
`;
