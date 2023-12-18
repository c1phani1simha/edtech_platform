import React from 'react'
import { FaArrowRight } from "react-icons/fa";
import { Link } from 'react-router-dom';
import HighlightText from '../components/core/HomePage/HighlightText';
import CTAButton from '../components/core/HomePage/Button';
import Banner from '../assets/Images/banner.mp4';
import CodeBlocks from '../components/core/HomePage/CodeBlocks';
import Footer from '../components/common/Footer';
const Home = () => {
  //Divided home page into 4 seperate sections
  //first - bg - blue
  //second - bg - white
  //third - bg - blue
  // fourth - footer
  return (
    <div className="relative mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-white justify-between gap-8">
      {/**Section 1 */}
      <div className="relative mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-white justify-between gap-8">
        <Link to={"/signup"}>
          <div className="group mx-auto mt-16 w-fit rounded-full bg-richblack-800 p-1 font-bold text-richblack-200 drop-shadow-[0_1.5px_rgba(255,255,255,0.25)] transition-all duration-200 hover:scale-95 hover:drop-shadow-none">
            <div className="flex flex-row items-center gap-2 rounded-full px-10 py-[5px] transition-all duration-200 group-hover:bg-richblack-900">
              <p>Become an Instructor</p>
              <FaArrowRight />{" "}
              {/* Put group in the parent element and group-hover: in all those child elements where we want the style on hover so when we hover on any space under parent then */}
            </div>{" "}
            {/* all child which contain group-hover: get styled  , for more detail see notes in public */}
          </div>
        </Link>

        <div className="text-center text-4xl font-semibold">
          Empower Your Future with
          <HighlightText text={"Coding Skills"} />{" "}
          {/* here we passed "Coding Skills" text as props in component <Highlight> so we apply filter in that text part*/}
        </div>

        <div className="-mt-3 w-[90%] text-center text-lg font-bold text-richblack-300">
          With our online coding courses, you can learn at your own pace, from
          anywhere in the world, and get access to a wealth of resources,
          including hands-on projects, quizzes, and personalized feedback from
          instructors.
        </div>

        <div className="flex flex-row gap-7 mt-8">
          {" "}
          {/* here we passed "Learn More" as a children in CTAButton component and here compnent is used because there are many button like this; */}
          <CTAButton active={true} linkto={"/signup"}>
            {" "}
            Learn More{" "}
          </CTAButton>{" "}
          {/* here active is passed as props because if active is true then button is yellow otherwise black; */}
          <CTAButton active={false} linkto={"/login"}>
            {" "}
            Book a Demo{" "}
          </CTAButton>
        </div>

        <div className="mx-3 my-7 shadow-[10px_-5px_50px_-5px] shadow-blue-200">
          <video
            muted
            loop
            autoPlay
            className="shadow-[20px_20px_rgba(255,255,255)]"
          >
            {" "}
            <source src={Banner} type="video/mp4" />{" "}
          </video>
        </div>

        {/**Code section 1 */}

        <div>
          <CodeBlocks
            position={"lg:flex-row"}
            heading={
              <div className="text-4xl font-semibold">
                Unlock Your with
                <HighlightText text={"Coding Potential "} />
                our online courses
              </div>
            }
            subHeading={
              "Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you."
            }
            ctabtn1={{
              text: "Try it yourself",
              linkto: "/signup",
              active: true,
            }}
            ctabtn2={{
              text: "Learn More",
              linkto: "/login",
            }}
            codeblock={`<!DOCTYPE html>
                <html lang="en">
                <head>               
                <title>This is myPage</title>
                </head>
                <body>
                <h1><a href="/">Header</a></h1>
                <nav>
                <a href="/one">One</a>
                 <a href="/two">Two</a><a href="/                three">Three</a>
                 </nav>
                 </body>`}
            codeColor={"text-yellow-25"}
            backgroundGradient={<div className="codeblock1 absolute"></div>}
          />
        </div>

        {/**Code section 2 */}

        <div>
          <CodeBlocks
            position={"lg:flex-row-reverse"}
            heading={
              <div className="w-[100%] text-4xl font-semibold lg:w-[50%]">
                Start
                <HighlightText text={"Coding in seconds "} />
              </div>
            }
            subHeading={
              "Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson."
            }
            ctabtn1={{
              text: "Continue Lesson",
              linkto: "/signup",
              active: true,
            }}
            ctabtn2={{
              text: "Learn More",
              linkto: "/login",
            }}
            codeblock={`import React from "react";\n import CTAButton from "./Button";\nimport TypeAnimation from "react-type";\nimport { FaArrowRight } from "react-icons/fa";\n\nconst Home = () => {\nreturn (\n<div>Home</div>\n)\n}\nexport default Home;`}
            codeColor={"text-white"}
            backgroundGradient={<div className='codeblock2 absolute'></div>}
          />
        </div>
      </div>

      {/***Section 2 */}

      {/**Section 3 */}

      {/**Footer */}
      <Footer />
    </div>
  );
}

export default Home