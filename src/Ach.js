export function Achievements({ scores, useAchievement, currentPage, setCurrentPage }) {
  const ach1 = useAchievement(scores.puzzlesSolved > 0);
  const ach2 = useAchievement(scores.puzzlesSolved === 10);
  const ach3 = useAchievement(scores.puzzlesSolved === 50);
  const ach4 = useAchievement(scores.livesLost > 0);
  const ach5 = useAchievement(scores.livesLost === 10);
  const ach6 = useAchievement(scores.lives === 9);
  const ach7 = useAchievement(scores.streak === 100);
  const ach8 = useAchievement(scores.points === 1000000);
  const ach9 = useAchievement(scores.maxLives === scores.damage)

  // blah blah blah react hooks must be called at the top of the component SHUT UP!!!!!!

  const achievements = [
    {
      name: "Clear!",
      desc: "Clear a board",
      req: ach1,
      icon: "assets/jovial.png",
      id: 1
    },
    {
      name: "Clear!?",
      desc: "Clear 10 boards",
      req: ach2,
      icon: "assets/jovial.png",
      id: 2
    },
    {
      name: "Clear!!!?",
      desc: "Clear 50 boards",
      req: ach3,
      icon: "assets/jovial.png",
      id: 3
    },
    {
      name: "First Blood",
      desc: "Lose a life",
      req: ach4,
      icon: "assets/jovial.png",
      id: 4
    },
    {
      name: "Bloodbath",
      desc: "Lose 10 lives",
      req: ach5,
      icon: "assets/jovial.png",
      id: 5
    },
    {
      name: "Lucky Cat",
      desc: "Have 9 lives at once",
      req: ach6,
      icon: "assets/jovial.png",
      id: 6
    },
    {
      name: "#100",
      desc: "Obtain a 100 streak.",
      req: ach7,
      icon: "assets/jovial.png",
      id: 7
    },
    {
      name: "1M",
      desc: "Have 1,000,000 pts in one run.",
      req: ach8,
      icon: "assets/jovial.png",
      id: 8
    },
    {
        name: "Risky Business",
        desc: "Have damage equal to your max lives.",
        req: ach9,
        icon: "assets/jovial.png",
        id: 9
    }
  ]

  // recycling css

  return (
    <>
    <div className="ach-container" style={{
      display: `${currentPage !== "ach" ? "none" : ""}`
    }}>
      <div className="ach-items-list">
        <div className="ach-title"> <h2>Achievements</h2> </div>
        <div className="items-scroll-container">
        {achievements.map((a) => {
          return (
          <div className="ach-list-item" key={a.id}>
            <div className="ach-list-item-image">
              <img src={a.icon} alt={a.name}/>
                
                <div className="">
                  <div className="ach-list-item-name">{a.name}</div>
                  <div className="ach-list-item-desc">{a.desc} {a.req ? '[✅]' : '[ ]'}</div>
                </div>
            </div>
          </div>
          );
        })}
        </div>
         <div className="item-buttons">
              <button
                className="back-button"
                onClick={() => {setCurrentPage("game")}}
              >
                Back
              </button>
          </div>
      </div>
    </div>
    </>
  );
}