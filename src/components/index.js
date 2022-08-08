import { useCallback, useEffect, useState } from "react";
import web3ModalSetup from "./../helpers/web3ModalSetup";
import Web3 from "web3";
import getAbi from "../Abi";
import logo from "./../assets/logo.svg";
import music from "./../assets/bg_music.mp3";



const useAudio = url => {
  const [audio] = useState(new Audio(url));
  const [playing, setPlaying] = useState(false);

  const toggle = () => setPlaying(!playing);

  useEffect(() => {
      audio.loop = true;
      playing ? audio.play() : audio.pause();
    },
    // eslint-disable-next-li
    // eslint-disable-next-line
    [playing]
  );

  useEffect(() => {
    audio.addEventListener('ended', () => setPlaying(false));
    return () => {
      audio.removeEventListener('ended', () => setPlaying(false));
    };
    // eslint-disable-next-li
    // eslint-disable-next-line
  }, []);

  return [playing, toggle];
};


/* eslint-disable no-unused-vars */
const web3Modal = web3ModalSetup();

const Interface = () => {
    const [Abi, setAbi] = useState();
    const [web3, setWeb3] = useState();
    const [isConnected, setIsConnected] = useState(false);
    const [injectedProvider, setInjectedProvider] = useState();
    const [refetch, setRefetch] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [accounts, setAccounts] = useState(null);
    const [current, setCurrent] = useState(null);
    const [connButtonText, setConnButtonText] = useState("CONNECT");
    const [refLink, setRefLink] = useState(
        "https://bnbthelostworld.finance/?ref=0x0000000000000000000000000000000000000000"
      );
    const [contractBalance, setContractBalance] = useState(0);
    const [userBalance,setUserBalance] = useState(0);
    const [userInvestment,setUserInvestment] = useState(0);
    const [userDailyRoi, setUserDailyRoi] = useState(0);
    const [dailyReward,setDailyReward] = useState(0);
    const [startTime,setClaimStartTime] = useState(0);
    const [deadline,setClaimDeadline] = useState(0);
    const [approvedWithdraw,setApprovedWithdraw] = useState(0);
    const [lastWithdraw,setLastWithdraw] = useState(0);
    const [nextWithdraw, setNextWithdraw] = useState(0);
    const [totalWithdraw,setTotalWithdraw] = useState(0);
    const [referralReward,setReferralReward] = useState(0);
    const [refTotalWithdraw, setRefTotalWithdraw] = useState(0);
    const [jackpotData, setJackpotData] = useState([]);
    const [value, setValue] = useState('');
    const [balance,setBalance] = useState(0);

    const [pendingMessage,setPendingMessage] = useState('');
    const [calculate,setCalculator] = useState('');

    const [playing, toggle] = useAudio(music);
    
    const queryParams = new URLSearchParams(window.location.search);
    let DefaultLink = queryParams.get("ref");
  
    if (DefaultLink === null) {
      DefaultLink = "0x9dda759C79d073509D020d74F084C5D2bd080000";
      // console.log("Default Ref",DefaultLink);
    }

    const logoutOfWeb3Modal = async () => {
        await web3Modal.clearCachedProvider();
        if (
          injectedProvider &&
          injectedProvider.provider &&
          typeof injectedProvider.provider.disconnect == "function"
        ) {
          await injectedProvider.provider.disconnect();
        }
        setIsConnected(false);
    
        window.location.reload();
      };
      const loadWeb3Modal = useCallback(async () => {
        const provider = await web3Modal.connect();
        setInjectedProvider(new Web3(provider));
        const acc = provider.selectedAddress
          ? provider.selectedAddress
          : provider.accounts[0];

        
        const short = shortenAddr(acc);
    
        setWeb3(new Web3(provider));
        setAbi(await getAbi(new Web3(provider)));
        setAccounts([acc]);
        setCurrent(acc);
        //     setShorttened(short);
        setIsConnected(true);
        
        setConnButtonText(short);
    
        provider.on("chainChanged", (chainId) => {
          console.log(`chain changed to ${chainId}! updating providers`);
          setInjectedProvider(new Web3(provider));
        });
    
        provider.on("accountsChanged", () => {
          console.log(`account changed!`);
          setInjectedProvider(new Web3(provider));
        });
    
        // Subscribe to session disconnection
        provider.on("disconnect", (code, reason) => {
          console.log(code, reason);
          logoutOfWeb3Modal();
        });
        // eslint-disable-next-line
      }, [setInjectedProvider]);

      useEffect(() => {
        setInterval(() => {
          setRefetch((prevRefetch) => {
            return !prevRefetch;
          });
        }, 3000);
      }, []);
    
      useEffect(() => {
        if (web3Modal.cachedProvider) {
          loadWeb3Modal();
        }

        // eslint-disable-next-line
      }, []);

      const shortenAddr = (addr) => {
        if (!addr) return "";
        const first = addr.substr(0, 3);
        const last = addr.substr(38, 41);
        return first + "..." + last;
      };
    
      useEffect(() => {
        const refData = async () => {
          if (isConnected && web3) {
            // now the referal link not showing
            const balance = await web3.eth.getBalance(current);
    
            const refLink = "https://bnbthelostworld.finance/?ref=" + current;
            setRefLink(refLink);
            setBalance(web3.utils.fromWei(balance));
          }
        };
    
        refData();
      }, [isConnected, current, web3, refetch]);

     
   


      useEffect(() => {
        const AbiContract = async () => {
          if (!isConnected || !web3) return;
         const contractBalance = await Abi.methods.getBalance().call();
         
       
         setContractBalance(contractBalance / 10e17);
         
       
        };
    
        AbiContract();
      }, [isConnected, web3, Abi, refetch]);


      useEffect(() => {
        const Contract = async () => {
          if (isConnected && Abi) {
            console.log(current);

          let userBalance = await web3.eth.getBalance(current);
          setUserBalance(userBalance);

          let userInvestment = await Abi.methods.investments(current).call();
          setUserInvestment(userInvestment.invested / 10e17);

          let dailyRoi = await Abi.methods.DailyRoi(userInvestment.invested).call();
          setUserDailyRoi(dailyRoi / 10e17);

          let dailyReward = await Abi.methods.userReward(current).call();
          setDailyReward(dailyReward / 10e17);
          }
        };
    
        Contract();
        // eslint-disable-next-line
      }, [refetch]);

      useEffect(() => {
        const Withdrawlconsole = async () => {
          if(isConnected && Abi) {
          let approvedWithdraw = await Abi.methods.approvedWithdrawal(current).call();
          setApprovedWithdraw(approvedWithdraw.amount / 10e17);

          let totalWithdraw = await Abi.methods.totalWithdraw(current).call();
          setTotalWithdraw(totalWithdraw.amount / 10e17);
        }
        }
        Withdrawlconsole();
        // eslint-disable-next-line
      },[refetch]);

      useEffect(() => {
        const TimeLine = async () => {
          if(isConnected && Abi) {
          let claimTime = await Abi.methods.claimTime(current).call();
          if(claimTime.startTime > 0) {
          let _claimStart = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}).format(claimTime.startTime + "000");
          let _claimEnd = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}).format(claimTime.deadline + "000");
          setClaimStartTime(_claimStart);

          setClaimDeadline(_claimEnd);

   

     

          let weekly = await Abi.methods.weekly(current).call();
          let _start = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}).format(weekly.startTime + "000");
          let _end = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}).format(weekly.deadline + "000");

          setLastWithdraw(_start);
          setNextWithdraw(_end);
        }
        }
        }
        TimeLine();
        // eslint-disable-next-line
      },[refetch]);


      useEffect(() => {
        const ContractReward = async () => {
          if (isConnected && Abi) {
        

          let refEarnedWithdraw = await Abi.methods.referral(current).call();
          setReferralReward(refEarnedWithdraw.reward / 10e17);

          let refTotalWithdraw = await Abi.methods.refTotalWithdraw(current).call();
          setRefTotalWithdraw(refTotalWithdraw.totalWithdraw / 10e17);


          }
        };
    
        ContractReward();
        // eslint-disable-next-line
      }, [refetch]);

      useEffect(() => {
        const Jackpot = async () => {
          if (isConnected && Abi) {
        
            let jackpotData = await Abi.methods.jackpot().call();

            const winnerTime = Number(jackpotData[0]);
            const lastAddr = shortenAddr(jackpotData[1]);
            const lastAmount = jackpotData[2] / 10e17;
            const addr = shortenAddr(jackpotData[3]);
            const amount = jackpotData[4] / 10e17;

            const newData = [winnerTime, lastAddr, lastAmount, addr, amount];

            setJackpotData(newData);
          } else {
            const newData = ["0", "0x0...000", "0", "0x0...000", "0"];

            setJackpotData(newData);
          }
        };
    
        Jackpot();
        // eslint-disable-next-line
      }, [refetch]);
      
       // buttons

    const ClaimNow = async (e) => {
        e.preventDefault();
        if (isConnected && Abi) {
           console.log("success")
           setPendingMessage("Claiming Funds")
          await Abi.methods.claimDailyRewards().send({
            from: current,
          });
          setPendingMessage("Claimed Successfully");
         
        } else {
          console.log("connect wallet");
        }
      };

      const withDraw = async (e) => {
        e.preventDefault();
        if (isConnected && Abi) {
           console.log("success")
           setPendingMessage("Withdrawing funds")
          await Abi.methods.withdrawal().send({
            from: current,
          });
          setPendingMessage("Successfully Withdraw");
         
        } else {
          console.log("connect wallet");
        }
      };

      const refWithdraw = async (e) => {
        e.preventDefault();
        if (isConnected && Abi) {
           console.log("success")
           setPendingMessage("Rewards withdrawing")
          await Abi.methods.Ref_Withdraw().send({
            from: current,
          });
          setPendingMessage("Successfully Withdraw");
         
        } else {
          console.log("connect wallet");
        }
      };
      
      const closeBar = async (e) => {
        e.preventDefault();
        setPendingMessage('');
      } 

      const deposit = async (e) => {
        e.preventDefault();
        if (isConnected && Abi) {
          console.log("success")
          setPendingMessage("Deposit Pending...!")
          let _value = web3.utils.toWei(value);
          await Abi.methods.deposit(DefaultLink).send({
              from: current,
              value: _value
          });
          setPendingMessage("Successfully Deposited")
        }
        else {
          console.log("connect wallet");
        }
      };

      const unStake = async (e) => {
        e.preventDefault();
        if(isConnected && Abi) {
          setPendingMessage("Unstaking");
          await Abi.methods.unStake().send({
            from: current,
          });
          setPendingMessage("UnStaked Successfully");
        }
        else {
          console.log("connect Wallet");
        }
      };
     
      // COUNT DOWN

  const [countdown, setCountdown] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const getCountdown = (deadline) => {
    const now = Date.now() / 1000;
    let total = deadline - now;
    if (total < 0) {
      total = 0;
    }
    const seconds = Math.floor((total) % 60);
    const minutes = Math.floor((total / 60) % 60);
    const hours = Math.floor((total / (60 * 60)) % 24);

    return {
        hours,
        minutes,
        seconds
    };
  }

  useEffect(() => {
    const interval = setInterval(() => {
        try {
          console.log(jackpotData[0]);
            const tillTime = 24 * 3600 + Number(jackpotData[0]);
            const data = getCountdown(tillTime);
            setCountdown({
                hours: data.hours,
                minutes: data.minutes,
                seconds: data.seconds
            })
        } catch (err) {
            console.log(err);
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [jackpotData[0]])


// RENDER

     return( 
         <>

<nav className="navbar navbar-expand-sm navbar-dark" style={{marginTop: "50px", marginBottom: "30px"}}>
{/* <div className="container"> */}
  <div className="container container-fluid">
    
    <a className="navbar-brand" href="https://bnbthelostworld.finance"><img src={logo} alt="logo" className="img-fluid" style={{width:"586px"}} /></a>
    
    <ul className="navbar-nav me-auto">
    </ul>

    <button className="btn-sound" onClick={toggle}>
      {playing ? <i className="fas fa-volume-mute"></i> : <i className="fas fa-volume-up"></i>}
      {playing ? " OFF" : " ON "}
    </button>

    <button className="btn btn-primary btn-lg btnd btn-custom" onClick={loadWeb3Modal}><i className="fas fa-wallet"></i> {connButtonText}</button>
  </div>
</nav>
<br />

          <div className="container">
             
        {pendingMessage!==''? 
         <>
           <center><div className="alert alert-warning alert-dismissible">
         <p onClick={closeBar} className="badge bg-dark" style={{float:"right",cursor: "pointer"}}>X</p>
               {pendingMessage}</div></center>
          </> :

          <></>
         }
        
              <div className="row">
                 <div className="col-sm-3">
                   <div className="card">
                     <div className="card-body">
                   <center>  <h3 className="subtitle">CONTRACT BALANCE</h3>
                     
                     <h3 className="value-text">{Number(contractBalance).toFixed(2)} BNB</h3>
                     
                     </center>
                     </div>
                   </div>
                 </div>

 

                 <div className="col-sm-3">
                   <div className="card">
                     <div className="card-body">
                   <center>  <h3 className="subtitle">DAILY ROI</h3>
                     
                     <h3 className="value-text">10%</h3>
                     
                     </center>
                     </div>
                   </div>
                 </div>


                 <div className="col-sm-3">
                   <div className="card">
                     <div className="card-body">
                   <center>  <h3 className="subtitle">WITHDRAWAL FEE</h3>
                     
                     <h3 className="value-text">5%</h3>
                     
                     </center>

                     </div>
                   </div>
                 </div>

                 <div className="col-sm-3">
                   <div className="card">
                     <div className="card-body">
                   <center>  <h3 className="subtitle">DEPOSIT FEE</h3>
                     
                     <h4 className="value-text">5%</h4>
                     
                     </center>
                     </div>
                   </div>
                 </div>

              </div>
            
                </div> 
 


           <br /> <div className="container">
           <div className="row">
            

             <div className="col-sm-4">
           <div className="card cardDino">
            
             <div className="card-body">
             <h4 className="subtitle-normal"><b>INVESTMENT PORTAL</b></h4>
                <hr />
             <table className="table">
               <tbody>
               <tr>
                 <td><h5 className="content-text"><b>WALLET BALANCE</b></h5></td>
                 <td style={{textAlign:"right"}}><h5 className="value-text">{Number(userBalance / 10e17).toFixed(2)} BNB</h5></td>
               </tr>

               <tr>
                 <td><h5 className="content-text"><b>USER INVESTED</b></h5></td>
                 <td style={{textAlign:"right"}}><h5 className="value-text">{Number(userInvestment).toFixed(2)} BNB</h5></td>
               </tr>

               <tr>
                 <td><h5 className="content-text"><b>5x PROFIT</b></h5></td>
                 <td style={{textAlign:"right"}}><h5 className="value-text">{Number(userInvestment * 5).toFixed(2)} BNB</h5></td>
               </tr>

               <tr>
                 <td><h5 className="content-text"><b>5x REMAINING</b></h5></td>
                 <td style={{textAlign:"right"}}><h5 className="value-text">{Number(userInvestment * 5 - totalWithdraw).toFixed(2)} BNB</h5></td>
               </tr>

               <tr>
                 <td><h5 className="content-text"><b>DAILY USER ROI</b></h5></td>
                 <td style={{textAlign:"right"}}><h5 className="value-text">{Number(userDailyRoi).toFixed(2)} BNB</h5></td>
               </tr>
               </tbody>
             </table>
           
             <form onSubmit={deposit}>
                 <table className="table">
                   <tbody>
                 <tr><td>  <input
                        type="number"
                        placeholder="0.25 BNB"
                        className="form-control input-box"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                      />
                 </td>


                
                <td style={{textAlign:"right"}}>
                            <button className="btn btn-primary btn-lg btn-custom">DEPOSIT</button>
                </td>

             </tr>
             </tbody>
            </table>
                      
             </form>
             
            
        
          <center>
      <button className="btn btn-primary btn-lg btn-custom" style={{marginTop:"-10px"}} onClick={unStake}>UNSTAKE</button>
     
</center>
             </div>
             </div>
     
           </div>
           

             <div className="col-sm-4">
             <div className="card cardDino">
               <div className="card-body">
               <h4 className="subtitle-normal"><b>STATISTICS</b></h4>
                <hr />
               <table className="table">
                 <tbody>
               <tr>
                 <td><h6 className="content-text14" style={{lineHeight: "20px"}}><b>DAILY REWARDS</b> <br /> <span className="value-text">{Number(dailyReward).toFixed(3)}/{userDailyRoi} BNB</span></h6></td>

                 <td style={{textAlign:"right"}}><button className="btn btn-primary btn-lg btn-custom" onClick={ClaimNow}>CLAIM</button></td>
               </tr>
               <tr>
                 <td><h6 className="content-text14" style={{lineHeight: "30px"}}><b>LAST CLAIM</b><br /><span className="value-text-12">{startTime}</span></h6></td>
                 
                 <td style={{textAlign:"right"}}><h6 className="content-text14" style={{lineHeight: "30px"}}><b>NEXT CLAIM</b><br /><span className="value-text-12">{deadline}</span></h6></td>
               </tr>

               <tr>
                 <td><h6 className="content-text14" style={{lineHeight: "20px"}}><b>50% AVAILABLE WITHDRAWAL</b> <br /><span className="value-text">{Number(approvedWithdraw).toFixed(3)} BNB</span></h6></td>
                 <td style={{textAlign:"right"}}><button className="btn btn-primary btn-lg btn-custom"  onClick={withDraw}>WITHDRAW</button></td>
               </tr>

               <tr>
                 <td><h6 className="content-text14" style={{lineHeight: "30px"}}><b>LAST WITHDRAWAL</b><br /><span className="value-text-12">{lastWithdraw}</span></h6></td>
                 
                 <td style={{textAlign:"right"}} ><h6 className="content-text14" style={{lineHeight: "30px"}}><b>NEXT WITHDRAWAL</b><br /><span className="value-text-12">{nextWithdraw}</span></h6></td>
               </tr>

           
               <tr>
                 <td><h5 className="content-text">TOTAL WITHDRAWN</h5></td>
                 <td style={{textAlign:"right"}}><h5 className="value-text">{Number(totalWithdraw).toFixed(3)} BNB</h5></td>
               </tr>

            </tbody>
             </table>
               </div>
             </div>
            </div>

            <div className="col-sm-4">
              <div className="card">
                <div className="card-body">
                <h4 className="subtitle-normal"><b>REFERRAL REWARDS  10%</b></h4>
                <hr />
                  <table className="table">
                    <tbody>
                    <tr>
                      <td><h5 className="content-text">BNB REWARDS</h5></td>
                      <td style={{textAlign:"right"}}><h5 className="value-text">{Number(referralReward).toFixed(2)} BNB</h5></td>
                    </tr>
                    <tr>
                      <td><h5 className="content-text">TOTAL WITHDRAWN</h5></td>
                      <td style={{textAlign:"right"}}><h5 className="value-text">{Number(refTotalWithdraw).toFixed(2)} BNB</h5></td>
                    </tr>
                    </tbody>
                  </table>
                 <center> <button className="btn btn-primary btn-lg btn-custom" onClick={refWithdraw}>WITHDRAW REWARDS</button> </center>
                </div>
              </div>
              <br />
              <div className="card">
                <div className="card-body">
                <h4 className="subtitle-normal"><b>REFERRAL LINK</b></h4>
              <hr />
               <form>
                <span className="content-text13">Share your referral link to earn 10% of BNB </span>
                <br />
                <br />
                 <input type="text" value={refLink} className="form-control input-box" readOnly />
            
               </form>
                 </div>
              </div>
            </div>
        
           </div>
        <br />
           <div className="row">
              <div className="col-sm-6">
                <div className="card">
                  <div className="card-header" style={{border: "none"}}>
                    <h3 className="subtitle-normal">20% DAILY JACKPOT</h3>
                    <h5 className="value-text-12" style={{lineHeight: "20px"}}>{`${countdown.hours}H ${countdown.minutes}M ${countdown.seconds}S`}</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-sm-6">

                      <h3 className="subtitle-normal" style={{fontSize: "16px", lineHeight: "20px"}}>CURRENT WINNER</h3>

                        <table className="table">
                          <tbody>
                            <tr style={{border: "hidden"}}>
                              <td><h6 className="content-text14"><b>ADDRESS</b> <br /> <span className="value-text">{jackpotData[3]}</span></h6></td>
                              <td style={{textAlign:"right"}}><h6 className="content-text14"><b>DEPOSIT</b><br /><span className="value-text">{Number(jackpotData[4]).toFixed(2)} BNB</span></h6></td>
                            </tr>
                          </tbody>
                        </table>

                        {/* <div className="row">
                          <div className="col-sm-6">
                            <h3 className="content-text14">ADDRESS</h3>
                          </div>
                          <div className="col-sm-6">
                            <h3 className="content-text14">DEPOSIT</h3>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-sm-6">
                            <h3 className="value-text">0x1C...25D</h3>
                          </div>
                          <div className="col-sm-6">
                            <h3 className="value-text">15.88 BNB</h3>
                          </div>
                        </div> */}

                      </div>
                      <div className="col-sm-6">

                        <h3 className="subtitle-normal" style={{fontSize: "16px", lineHeight: "20px"}}>PREVIOUS WINNER</h3>

                        <table className="table">
                          <tbody>
                            <tr style={{border: "hidden", paddingRight: "10px"}}>
                              <td><h6 className="content-text14"><b>ADDRESS</b> <br /> <span className="value-text">{jackpotData[1]}</span></h6></td>
                              <td style={{textAlign:"right"}}><h6 className="content-text14"><b>DEPOSIT</b><br /><span className="value-text">{Number(jackpotData[2]).toFixed(2)} BNB</span></h6></td>
                            </tr>
                          </tbody>
                        </table>

                        {/* <div className="row">
                          <div className="col-sm-6">
                            <h3 className="content-text14">ADDRESS</h3>
                          </div>
                          <div className="col-sm-6">
                            <h3 className="content-text14">DEPOSIT</h3>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-sm-6">
                            <h3 className="value-text">0x1C...25D</h3>
                          </div>
                          <div className="col-sm-6">
                            <h3 className="value-text">15.88 BNB</h3>
                          </div>
                        </div> */}

                      </div>
                    </div>
                  </div>
                </div>
              </div>
             <div className="col-sm-6">
               <div className="card">
                 <div className="card-header" style={{border: "none"}}>
                  <h3 className="subtitle-normal">INVESTMENT CALCULATOR</h3>
                 </div>
                
                 <div className="card-body" style={{paddingTop: "0.6rem"}}>
                  
                 <div className="row">
                   <div className="col-sm-6">
                   {/* <h3 className="subtitle-normal" style={{fontSize: "16px"}}>BNB AMOUNT</h3> */}
                   <input
                     type="number"
                     placeholder="0.25 BNB"
                     className="form-control input-box"
                     value={calculate}
                     onChange={(e) => setCalculator(e.target.value)}
                   />
                   <br />
                   <p className="content-text13">Amount of returns calculated on the basis of investment amount. 
<br />
<b>Note:</b> Min investment is 0.25 BNB & max amount of investment in 350 BNB.</p>
                   </div>
                   <div className="col-sm-6" style={{textAlign:"right"}}>
                     <h3 className="subtitle-normal" style={{fontSize: "16px"}}>ROI</h3>
                  <p className="content-text">DAILY RETURN: <span className="value-text">{Number(calculate / 100 * 10).toFixed(3)} BNB</span> <br /> WEEKLY RETURN: <span className="value-text">{Number(calculate / 100 * 10 * 7).toFixed(3)} BNB</span>  <br /> MONTHLY RETURN: <span className="value-text">{Number(calculate / 100 * 10 * 30).toFixed(3)} BNB</span> </p> 
                     </div>
                 </div>
                 </div>
               </div>
             </div>
           </div>
  <br />

           <br />
           <center>
            <h5 className="footer-item-text">
              <a href="https://bnb-tlw.gitbook.io/bnb-the-lost-world/" target="_blank" rel="noreferrer" style={{color:"#ffffff",textDecoration:"none"}}> DOCS </a>&nbsp;&nbsp;&nbsp;
              <a href="https://twitter.com/BnbTheLostWorld" target="_blank" rel="noreferrer" style={{color:"#ffffff",textDecoration:"none"}}> TWITTER </a>&nbsp;&nbsp;&nbsp;
              <a href="https://t.me/BNBTheLostWorld" target="_blank" rel="noreferrer" style={{color:"#ffffff",textDecoration:"none"}}> TELEGRAM </a>&nbsp;&nbsp;&nbsp;
              <a href="https://bscscan.com/address/0xEA5617Cc7f614D987C85ABb8bCFD37c46606c13A#code" target="_blank" rel="noreferrer" style={{color:"#ffffff",textDecoration:"none"}}> CONTRACT </a>&nbsp;&nbsp;&nbsp;
              <a href="https://drive.google.com/file/d/1sBtPvzUwC8S2wNyARgAyLmDJ28_aMDan/view" target="_blank" rel="noreferrer" style={{color:"#ffffff",textDecoration:"none"}}> AUDIT </a>
            </h5>
            <br />
            <p style={{color: "#ffffff",fontSize: "14px",fontWeight: "200"}}>COPYRIGHT © 2022 BNBTHELOSTWORLD.FINANCE ALL RIGHTS RESERVED</p>
           </center>
           <br />
    </div>
          </> 
         
     );
}

export default Interface;
