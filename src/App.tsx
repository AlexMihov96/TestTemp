import { useMemo, useState } from "react";

const MAX_PICK = 5;

const foodOptions = [
  "Strawberry pancakes",
  "Sushi platter",
  "Truffle pasta",
  "Margherita pizza",
  "Tacos al pastor",
  "Korean fried chicken",
  "Caprese salad",
  "Ramen",
  "Steak bites",
  "Chocolate fondue",
  "Macarons",
  "Cheesecake",
];

const drinkOptions = [
  "Sparkling rose",
  "Hot cocoa",
  "Matcha latte",
  "Iced coffee",
  "Lavender lemonade",
  "Boba tea",
  "Strawberry milk",
  "Mocktail spritz",
  "Chai",
  "Cold brew",
  "Berry smoothie",
  "Vanilla milkshake",
];

const movieOptions = [
  { title: "The Notebook", actor: "Ryan Gosling" },
  { title: "Pride and Prejudice", actor: "Keira Knightley" },
  { title: "A Walk to Remember", actor: "Mandy Moore" },
  { title: "The Vow", actor: "Rachel McAdams" },
  { title: "Dear John", actor: "Channing Tatum" },
  { title: "Safe Haven", actor: "Julianne Hough" },
  { title: "The Best of Me", actor: "James Marsden" },
  { title: "The Longest Ride", actor: "Scott Eastwood" },
  { title: "The Lucky One", actor: "Zac Efron" },
  { title: "About Time", actor: "Domhnall Gleeson" },
  { title: "Before Sunrise", actor: "Ethan Hawke" },
  { title: "Notting Hill", actor: "Julia Roberts" },
  { title: "One Day", actor: "Anne Hathaway" },
  { title: "Me Before You", actor: "Emilia Clarke" },
  { title: "The Fault in Our Stars", actor: "Shailene Woodley" },
];

const prompts = [
  "Will you be my Valentine?",
  "Pretty please?",
  "I brought chocolate...",
  "I'll plan everything!",
  "I'll do the dishes too",
  "I'll pick the comfiest blankets",
  "Just say yes and we'll dance",
  "You + me = perfect night",
  "I'll make you laugh",
  "One last time?",
  "Ok, I'm sad now...",
];

function pickRandom<T>(list: T[], count: number) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

function togglePick(
  value: string,
  picks: string[],
  setPicks: (v: string[]) => void
) {
  if (picks.includes(value)) {
    setPicks(picks.filter((p) => p !== value));
    return;
  }
  if (picks.length >= MAX_PICK) return;
  setPicks([...picks, value]);
}

export default function App() {
  const [noCount, setNoCount] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  const [foods, setFoods] = useState<string[]>([]);
  const [drinks, setDrinks] = useState<string[]>([]);
  const [movies, setMovies] = useState<string[]>([]);

  const scriptUrl = import.meta.env.VITE_SCRIPT_URL ?? "";
  const isSad = noCount >= 10 && !accepted;
  const canProceedFromStep = (current: 1 | 2 | 3) => {
    if (current === 1) return foods.length >= 1;
    if (current === 2) return drinks.length >= 1;
    return movies.length >= 1;
  };

  const canGoToStep = (target: 1 | 2 | 3) => {
    if (target === 1) return true;
    if (target === 2) return foods.length >= 1;
    return foods.length >= 1 && drinks.length >= 1;
  };
  const canSubmit =
    foods.length >= 1 && drinks.length >= 1 && movies.length >= 1;
  const handleSubmit = async () => {
    if (!scriptUrl) {
      setSubmitStatus("error");
      return;
    }
    setSubmitStatus("sending");
    try {
      const body = new URLSearchParams({
        foods: foods.join(", "),
        drinks: drinks.join(", "),
        movies: movies.join(", "),
        submittedAt: new Date().toISOString(),
      });
      await fetch(scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      setSubmitStatus("sent");
    } catch {
      setSubmitStatus("error");
    }
  };
  const promptText = useMemo(() => {
    const index = Math.min(noCount, prompts.length - 1);
    return prompts[index];
  }, [noCount]);

  const attempt = Math.min(noCount + 1, 11);

  return (
    <div className="page">
      <div className="glow" />
      {submitStatus === "sent" && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 36 }).map((_, i) => (
            <span key={i} className="confetti-piece" />
          ))}
        </div>
      )}
      <main className="container py-5">
        <div className="row justify-content-center min-vh-100 align-items-center">
          <div className="col-12 col-lg-9">
            <div className="card hero border-0 shadow-lg">
              <div className="card-body p-4 p-md-5">
                {!accepted && (
                  <section className="text-center">
                    <div className="badge soft-badge px-3 py-2 mb-3">
                      Valentine Invite - Attempt {attempt}/11
                    </div>
                    {!isSad && (
                      <>
                        <h1 className="display-5 fw-bold mb-3">{promptText}</h1>
                        <p className="lead text-muted mb-4">
                          A cozy night, cute treats, and you in the center of it
                          all.
                        </p>
                        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                          <button
                            className="btn btn-lg btn-love px-5"
                            onClick={() => setAccepted(true)}
                          >
                            Yes
                          </button>
                          <button
                            className="btn btn-lg btn-outline-light px-5"
                            onClick={() => setNoCount((c) => c + 1)}
                          >
                            No
                          </button>
                        </div>
                      </>
                    )}
                    {isSad && (
                      <div className="sad-box">
                        <div className="sad-emoji">😢</div>
                        <h2 className="fw-bold mt-3">Ok... I'm heartbroken.</h2>
                        <p className="text-muted mb-4">
                          If you change your mind, I'll be right here.
                        </p>
                        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                          <button
                            className="btn btn-lg btn-love px-5"
                            onClick={() => setAccepted(true)}
                          >
                            Fine, yes
                          </button>
                          <button
                            className="btn btn-lg btn-outline-light px-5"
                            onClick={() => setNoCount(0)}
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {accepted && (
                  <section>
                    <div className="text-center mb-4">
                      <div className="badge soft-badge px-3 py-2 mb-3">
                        She said yes - Planning time
                      </div>
                      <h1 className="display-6 fw-bold">
                        Let's plan the perfect night
                      </h1>
                      <p className="text-muted">
                        Choose up to 5 items in each list. Movies can be random if
                        you want.
                      </p>
                    </div>

                    <div className="stepper d-flex flex-column flex-md-row gap-2 justify-content-center mb-4">
                      <button
                        className="step-btn home-btn"
                        onClick={() => {
                          setAccepted(false);
                          setStep(1);
                        }}
                      >
                        <span className="step-number">🏠</span>
                        <span className="step-label">Home</span>
                      </button>
                      {[
                        { id: 1, label: "Eat" },
                        { id: 2, label: "Drink" },
                        { id: 3, label: "Movies" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          className={`step-btn ${
                            step === item.id ? "active" : ""
                          }`}
                          onClick={() => setStep(item.id as 1 | 2 | 3)}
                          disabled={!canGoToStep(item.id as 1 | 2 | 3)}
                        >
                          <span className="step-number">{item.id}</span>
                          <span className="step-label">{item.label}</span>
                        </button>
                      ))}
                    </div>

                    {step === 1 && (
                      <div className="card option-card">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="h5 mb-0">Eat</h3>
                            <span className="counter">
                              {foods.length}/{MAX_PICK}
                            </span>
                          </div>
                          <div className="list-group list-group-flush">
                            {foodOptions.map((item) => {
                              const checked = foods.includes(item);
                              const disabled =
                                !checked && foods.length >= MAX_PICK;
                              return (
                                <label
                                  key={item}
                                  className={`list-group-item option-item ${
                                    checked ? "active" : ""
                                  } ${disabled ? "disabled" : ""}`}
                                >
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    checked={checked}
                                    disabled={disabled}
                                    onChange={() =>
                                      togglePick(item, foods, setFoods)
                                    }
                                  />
                                  {item}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="card option-card">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="h5 mb-0">Drink</h3>
                            <span className="counter">
                              {drinks.length}/{MAX_PICK}
                            </span>
                          </div>
                          <div className="list-group list-group-flush">
                            {drinkOptions.map((item) => {
                              const checked = drinks.includes(item);
                              const disabled =
                                !checked && drinks.length >= MAX_PICK;
                              return (
                                <label
                                  key={item}
                                  className={`list-group-item option-item ${
                                    checked ? "active" : ""
                                  } ${disabled ? "disabled" : ""}`}
                                >
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    checked={checked}
                                    disabled={disabled}
                                    onChange={() =>
                                      togglePick(item, drinks, setDrinks)
                                    }
                                  />
                                  {item}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="card option-card">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="h5 mb-0">Movies</h3>
                            <span className="counter">
                              {movies.length}/{MAX_PICK}
                            </span>
                          </div>
                          <div className="d-flex gap-2 mb-3 flex-wrap">
                            <button
                              className="btn btn-sm btn-outline-light"
                              onClick={() =>
                                setMovies(
                                  pickRandom(movieOptions, MAX_PICK).map(
                                    (movie) => movie.title
                                  )
                                )
                              }
                            >
                              Randomize 5
                            </button>
                            <button
                              className="btn btn-sm btn-outline-light"
                              onClick={() => setMovies([])}
                            >
                              Clear
                            </button>
                          </div>
                          <div className="list-group list-group-flush">
                            {movieOptions.map((movie) => {
                              const checked = movies.includes(movie.title);
                              const disabled =
                                !checked && movies.length >= MAX_PICK;
                              return (
                                <label
                                  key={movie.title}
                                  className={`list-group-item option-item ${
                                    checked ? "active" : ""
                                  } ${disabled ? "disabled" : ""}`}
                                >
                                  <input
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    checked={checked}
                                    disabled={disabled}
                                    onChange={() =>
                                      togglePick(
                                        movie.title,
                                        movies,
                                        setMovies
                                      )
                                    }
                                  />
                                  <div>{movie.title}</div>
                                  <div className="small text-muted">
                                    {movie.actor}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <button
                        className="btn btn-outline-light"
                        onClick={() =>
                          setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))
                        }
                        disabled={step === 1}
                      >
                        Back
                      </button>
                      <div className="small text-muted">
                        Step {step} of 3
                      </div>
                      <button
                        className="btn btn-love"
                        onClick={() =>
                          setStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s))
                        }
                        disabled={step === 3 || !canProceedFromStep(step)}
                      >
                        Next
                      </button>
                    </div>

                    <div className="summary card mt-4 border-0">
                      <div className="card-body">
                        <h3 className="h5 mb-3">Your picks</h3>
                        <div className="row g-3">
                          <div className="col-12 col-md-4">
                            <div className="summary-box">
                              <div className="summary-title">Eat</div>
                              <div className="summary-items">
                                {foods.length
                                  ? foods.join(", ")
                                  : "Pick at least 1"}
                              </div>
                            </div>
                          </div>
                          <div className="col-12 col-md-4">
                            <div className="summary-box">
                              <div className="summary-title">Drink</div>
                              <div className="summary-items">
                                {drinks.length
                                  ? drinks.join(", ")
                                  : "Pick at least 1"}
                              </div>
                            </div>
                          </div>
                          <div className="col-12 col-md-4">
                            <div className="summary-box">
                              <div className="summary-title">Movies</div>
                              <div className="summary-items">
                                {movies.length
                                  ? movies.join(", ")
                                  : "Pick at least 1"}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between mt-4">
                          <div className="small text-muted">
                            {submitStatus === "idle" &&
                              "Ready to send your plan?"}
                            {submitStatus === "sending" &&
                              "Sending your picks..."}
                            {submitStatus === "sent" &&
                              "Sent! I'll take care of the rest."}
                            {submitStatus === "error" &&
                              "Couldn't send. Check the setup and try again."}
                          </div>
                          <button
                            className="btn btn-love px-4"
                            onClick={handleSubmit}
                            disabled={!canSubmit || submitStatus === "sending"}
                          >
                            Submit our plan
                          </button>
                        </div>
                        {submitStatus === "sent" && (
                          <div className="celebrate mt-4">
                            <div className="fireworks">
                              <span className="firework" />
                              <span className="firework" />
                              <span className="firework" />
                            </div>
                            <div className="celebrate-text">
                              Hooray! Your choices were sent to your "mrvkic malkic milkic", and he will reach out to you very soon!
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </div>

            <div className="footer text-center mt-4">
              <span className="small text-muted">
                Made for YOU with love and desire!
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
