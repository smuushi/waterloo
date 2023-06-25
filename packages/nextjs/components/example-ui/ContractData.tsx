import { lightTheme } from "@rainbow-me/rainbowkit";
import { write } from "fs";
import { useEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";
import { useAccount } from "wagmi";
// import "./rightside.css"
import {
  useAnimationConfig,
  useScaffoldContract,
  useScaffoldContractRead,
  useScaffoldContractWrite,
  useScaffoldEventHistory,
  useScaffoldEventSubscriber,
} from "~~/hooks/scaffold-eth";

const MARQUEE_PERIOD_IN_SEC = 5;

export const ContractData = () => {
  const { address } = useAccount();
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isRightDirection, setIsRightDirection] = useState(false);
  const [marqueeSpeed, setMarqueeSpeed] = useState(0);
  const [selectedVillgaer, setSelectedVillager] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const greetingRef = useRef<HTMLDivElement>(null);

  const { data: totalCounter } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "totalCounter",
  });

  const { data: currentGreeting, isLoading: isGreetingLoading } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "greeting",
  });

  const { data: villagers } = useScaffoldContractRead({
    contractName: "YourContract",
    functionName: "showAllVillagers",
  });

  // const { data: ownedVillagers } = useScaffoldContractRead({
  //   contractName: "YourContract",
  //   functionName: "villagerToOwner"
  //   args: address
  // })

  useScaffoldEventSubscriber({
    contractName: "YourContract",
    eventName: "GreetingChange",
    listener: (greetingSetter, newGreeting, premium, value) => {
      console.log(greetingSetter, newGreeting, premium, value);
    },
  });

  const {
    data: myGreetingChangeEvents,
    isLoading: isLoadingEvents,
    error: errorReadingEvents,
  } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "GreetingChange",
    fromBlock: Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0,
    filters: { greetingSetter: address },
    blockData: true,
  });

  console.log("Events:", isLoadingEvents, errorReadingEvents, myGreetingChangeEvents);

  const { data: yourContract } = useScaffoldContract({ contractName: "YourContract" });
  console.log("yourContract: ", yourContract);

  const { showAnimation } = useAnimationConfig(totalCounter);

  const showTransition = transitionEnabled && !!currentGreeting && !isGreetingLoading;

  useEffect(() => {
    if (transitionEnabled && containerRef.current && greetingRef.current) {
      setMarqueeSpeed(
        Math.max(greetingRef.current.clientWidth, containerRef.current.clientWidth) / MARQUEE_PERIOD_IN_SEC,
      );
    }
  }, [transitionEnabled, containerRef, greetingRef]);

  console.log("all villagers", villagers)
  // console.log(address)

  // debugger

  const [yourVillagers, setYourVillagers] = useState({})

  // const yourVillagers = [];

  useEffect(() => {

    let tempVillagers = {};
    villagers?.forEach((villager, idx) => {
      // debugger
      if (villager.owner === address){
        // debugger
        tempVillagers[idx] = villager;
      }

    setYourVillagers(() => tempVillagers)

    })
  },[villagers])

  

  console.log("your villagers", yourVillagers)
  // console.log(yourVillagers)
  // console.log(yourVillagers)
  // console.log(yourVillagers)
  // console.log(yourVillagers)
  const [newVillagerName, setNewVillagerName] = useState("")

  const { writeAsync, isLoading } = useScaffoldContractWrite({
    contractName: "YourContract",
    functionName: "createRandomVillager",
    args: [newVillagerName],
    // value: "0.01",
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });


  let papaya;

  // if (villagers) {
  //   papaya = Object.values(villagers)
  // }

  // console.log(papaya)
  // debugger
  // useEffect(() => {

    // if (villagers){
  papaya = Object.values(yourVillagers)?.map((villager) => <li> {villager.name}</li>)
  //   }

  // },[villagers])

  if (Object.values(yourVillagers).length > 0){
    return (
      <> 
      <div className="rightside" id="rightside">

       
          <div
            className={`flex flex-col max-w-md bg-base-200 bg-opacity-70 rounded-2xl shadow-lg px-5 py-4 w-full ${
              showAnimation ? "animate-zoom" : ""
            }`}
            >
            <div className="flex justify-between w-full">

                  <div className="bg-secondary border border-primary rounded-xl flex">
                    <div className="p-2 py-1 border-r border-primary flex items-end">Total count</div>
                    <div className="text-4xl text-right min-w-[3rem] px-2 py-1 flex justify-end font-bai-jamjuree">
                      {totalCounter?.toString() || "0"}
                    </div>
                  </div>


                  <div className="bg-secondary border border-primary rounded-xl flex">
                    <div className="p-2 py-1 border-r border-primary flex items-end">All Total Villagers</div>
                    <div className="text-4xl text-right min-w-[3rem] px-2 py-1 flex justify-end font-bai-jamjuree">
                      {villagers?.length || "none atm"}
                    </div>
                  </div>



            </div>

            <div className="bg-secondary border border-primary rounded-xl flex">
                    <div className="p-2 py-1 border-r border-primary flex items-end">Your Villagers</div>
                    <div className="text-4xl text-right min-w-[3rem] px-2 py-1 flex justify-end font-bai-jamjuree">
                        <ul>
                          {papaya? papaya : null}
                        </ul>
                    </div>
                  </div>

          </div>
        </div>
      </>
    ) 
  } else {
    return (
      <>
      <div className="rightside" id="rightside">

        <section>
          <h1 className="header"> Create a Villager!</h1>
          <p> Currently there are no villager NFTs in your wallet. Please mint one to start building up your founderville!</p>
        </section>

        <section>
          <input type="text" value={newVillagerName} onChange={(e) => setNewVillagerName(e.target.value)}/>
          <button onClick={writeAsync}>
            mint!
          </button>
        </section>


      </div>


      </>
    )
  }

  // return (
    // <div className="flex flex-col justify-center items-center bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw] ">
      // <div
      //   className={`flex flex-col max-w-md bg-base-200 bg-opacity-70 rounded-2xl shadow-lg px-5 py-4 w-full ${
      //     showAnimation ? "animate-zoom" : ""
      //   }`}
      // >
      //   <div className="flex justify-between w-full">
      //     <button
      //       className="btn btn-circle btn-ghost relative bg-center bg-[url('/assets/switch-button-on.png')] bg-no-repeat"
      //       onClick={() => {
      //         setTransitionEnabled(!transitionEnabled);
      //       }}
      //     >
      //       <div
      //         className={`absolute inset-0 bg-center bg-no-repeat bg-[url('/assets/switch-button-off.png')] transition-opacity ${
      //           transitionEnabled ? "opacity-0" : "opacity-100"
      //         }`}
      //       />
      //     </button>
      //     <div className="bg-secondary border border-primary rounded-xl flex">
      //       <div className="p-2 py-1 border-r border-primary flex items-end">Total count</div>
      //       <div className="text-4xl text-right min-w-[3rem] px-2 py-1 flex justify-end font-bai-jamjuree">
      //         {totalCounter?.toString() || "0"}
      //       </div>
      //     </div>
      //       <br/>

      //     <div className="bg-secondary border border-primary rounded-xl flex">
      //       <div className="p-2 py-1 border-r border-primary flex items-end">All Villagers</div>
      //       <div className="text-4xl text-right min-w-[3rem] px-2 py-1 flex justify-end font-bai-jamjuree">
      //         {villagers?.toString() || "none atm"}
      //       </div>
      //     </div>


      //   </div>

  //       <div className="bg-secondary border border-primary rounded-xl flex">
  //           <div className="p-2 py-1 border-r border-primary flex items-end">Your Villagers</div>
  //           <div className="text-4xl text-right min-w-[3rem] px-2 py-1 flex justify-end font-bai-jamjuree">
  //             {Object.values(yourVillagers).map((villager) => villager.name).toString() || "none atm"}
  //           </div>
  //         </div>

  //       <div className="mt-3 border border-primary bg-neutral rounded-3xl text-secondary  overflow-hidden text-[116px] whitespace-nowrap w-full uppercase tracking-tighter font-bai-jamjuree leading-tight">
  //         <div className="relative overflow-x-hidden" ref={containerRef}>
  //           {/* for speed calculating purposes */}
  //           <div className="absolute -left-[9999rem]" ref={greetingRef}>
  //             <div className="px-4">{currentGreeting}</div>
  //           </div>
  //           {new Array(3).fill("").map((_, i) => {
  //             const isLineRightDirection = i % 2 ? isRightDirection : !isRightDirection;
  //             return (
  //               <Marquee
  //                 key={i}
  //                 direction={isLineRightDirection ? "right" : "left"}
  //                 gradient={false}
  //                 play={showTransition}
  //                 speed={marqueeSpeed}
  //                 className={i % 2 ? "-my-10" : ""}
  //               >
  //                 <div className="px-4">{currentGreeting || " "}</div>
  //               </Marquee>
  //             );
  //           })}
  //         </div>
  //       </div>

  //       <div className="mt-3 flex items-end justify-between">
  //         <button
  //           className={`btn btn-circle btn-ghost border border-primary hover:border-primary w-12 h-12 p-1 bg-neutral flex items-center ${
  //             isRightDirection ? "justify-start" : "justify-end"
  //           }`}
  //           onClick={() => {
  //             if (transitionEnabled) {
  //               setIsRightDirection(!isRightDirection);
  //             }
  //           }}
  //         >
  //           <div className="border border-primary rounded-full bg-secondary w-2 h-2" />
  //         </button>
  //         <div className="w-44 p-0.5 flex items-center bg-neutral border border-primary rounded-full">
  //           <div
  //             className="h-1.5 border border-primary rounded-full bg-secondary animate-grow"
  //             style={{ animationPlayState: showTransition ? "running" : "paused" }}
  //           />
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
};
