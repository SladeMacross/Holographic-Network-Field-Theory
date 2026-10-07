# HNET Simulator Report
Covers the Claude Code session of October 6–7, 2026. The full simulator code is in the appendix, so this report stands on its own if the files don't come along.

## 1. Short version
- A toy simulator now exists and is saved: `hnet_sim.py`, in `Projects\HNET`. It uses only standard Python 3.11, with nothing to install.
- It models the substrate as a graph, massive patterns as persistent groups of nodes, and photons as event records only. Absorbers are chosen by hard blocks, weighting and resolution. Cancellation is not built yet.
- David made two decisions during the session: the absorber is chosen at arrival, not at emission, and the rate rule applies to absorption through weighting.
- One new open question came out of the second run (Section 6.1). It's David's to decide.
- Nothing here validates HNET. Every number comes from placeholder settings. The simulator stress-tests the concepts; it confirms nothing.

## 2. How the session went
1. David pasted the simulator project notes (the CLAUDE.md spec). The session was open in the wrong folder (`Projects\Hacker Game`). HNET lives in `Projects\HNET`, which at the start held only `hnet.txt`, the October 6 handoff report. `HNET_framework.md` and `HNET_history.md` were not found anywhere in the Projects folder.
2. David pasted the full HNET handoff report (current as of October 6, 2026), the same report saved as `hnet.txt`. Claude treated it as the current state of HNET and set aside the older loose `hnet*.txt` files in `Projects`.
3. Claude withdrew one of its own early suggestions: representing a photon as a node with a massless flag. A persistent node is something maintained between events, which Section 6 of the handoff report says a photon doesn't have. A weakly connected node would also imply a spectrum.
4. Claude proposed a design (Section 3), explained in plain terms what each part would do, and David approved it.
5. Step 1 was built and run (run 1). It surfaced two gaps.
6. David decided both gaps (Section 5). Claude built the decisions in, re-ran (run 2) and created `CLAUDE.md` in `Projects\HNET`.

## 3. Design (Claude's suggestions, approved by David)
- **Substrate:** nodes joined by weighted links.
- **Massive patterns:** persistent groups of linked nodes. Only these have an embedding depth.
- **Massless patterns:** never stored in the graph. A photon exists only as two event records, an emission and an absorption. The code has no slot for a photon, so it can't accidentally treat one as a weakly connected massive thing. This keeps the binary sharp. It doesn't prove anything about photons.
- **Event log:** append-only, never edited, matching irreversibility.
- **Own time:** a massive pattern's own time is the number of events it has taken part in. "Resolution advances local time" follows directly. A zero-survivor tick would show up as a tick where the count doesn't go up.
- **Global tick:** a modeling convenience, not an HNET claim. HNET has no shared universal moment; the tick is only how the program orders its work.
- **Connectivity limit (for later decoherence tests):** in a graph, "connected" can only mean linked to nearby nodes, which is the local meaning. A decoherence result would support only the local reading of connectivity, never the global, holographic one.

## 4. Run 1 (step 1, before David's decisions)
At the time, the absorber was picked at emission and absorptions skipped the rate rule.

| Pattern | Nodes | Embedding depth | Own time per tick |
|---|---|---|---|
| A | 3 | 2.8 | 0.90 |
| B | 6 | 11.9 | 0.65 |
| C | 10 | 27.2 | 0.46 |

- Deep C ran slowest **because the rate rule was written that way.** That is the rule working as coded, not a finding.
- **Gap 1:** to make a photon arrive later, the program had to decide the absorber at emission and hold that in a list between the photon's two events. That conflicts with "nothing maintained between events."
- **Gap 2:** absorptions always happened and added to own time, bypassing the rate rule. That's why C measured 0.46, while the rule alone gives about 0.27.

## 5. David's decisions (October 6, 2026)
**Decision 1: the absorber is chosen at arrival, not at emission.**
- At emission, nothing decides who absorbs. Only the effects of the emission event spread outward through the links at a connectivity-limited speed. In code, these are `spreading_effects`, documented as effects of the emission event, not as photon state.
- When the effects reach candidate absorbers, the three stages choose the absorber.
- Conservation is a hard requirement: someone must absorb the photon's energy.
- Reason: pre-deciding the absorber meant the program held information about the photon between its events.

**Decision 2: the rate rule applies to absorption too.**
- Absorption is event participation, and nothing in the framework exempts it.
- Deep patterns can't refuse an absorption, because a photon must end somewhere. Instead, a candidate absorber's weight goes down as its embedding depth goes up. Shallow absorbers are favored, and someone always absorbs.
- The weight function is a placeholder, a suggestion, not framework content.

**Recorded open item:** the framework does not yet say how a photon's second event (its absorber) gets selected.

## 6. Run 2 (after both decisions)
| Pattern | Rate rule alone | Events started | Absorptions | Own time per tick |
|---|---|---|---|---|
| A | 0.78 | 1577 | 326 | 0.95 |
| B | 0.46 | 933 | 339 | 0.64 |
| C | 0.27 | 557 | 241 | **0.40** |

C moved from 0.46 to 0.40, toward 0.27, but stopped well short. No settings were adjusted to hit a number.

### 6.1 New open question (David's call)
C starts events at about 0.28, which matches the rule. Absorptions add on top of that. Conservation forces roughly 900 photons to be absorbed, and with only three patterns and the emitter blocked, every photon goes to one of the other two. Weighting can shift C's share down, but not to zero. So under decisions 1 and 2 together, **any pattern that absorbs will run faster than the rate rule.** The rule as written covers events a pattern *starts*, not everything it takes part in. There are two ways forward:
- the rate rule covers all participation, so absorbing uses up some of a pattern's chance to start events, or
- 0.27 is not the right expectation once absorption counts.

### 6.2 Claude's additions that still need flagging
- **When absorption happens (placeholder):** resolution happens on the first tick the spreading effects reach any candidate. A nearer candidate always beats a farther one, and weighting only decides among candidates reached on the same tick. In this graph, all three patterns happen to be 3 links apart, so weighting decided every absorption. In another graph, distance would decide most absorptions. This belongs under the open item in Section 5.
- **The emitter can't absorb its own photon (placeholder).**
- **Cancellation isn't built yet.** "The three stages" currently means hard blocks (effects haven't reached the candidate yet; the emitter block), then weighting, then resolution.

### 6.3 Code checks (consistency, not findings)
All passed in run 2:
- no nodes or links added or removed
- the log never goes back in time
- each photon has one emission and at most one absorption
- energy emitted = energy absorbed + energy still spreading
- no emission effects were left stuck with no possible absorber

The run ended with 2 emissions whose effects were still spreading.

## 7. Placeholders (all in the PLACEHOLDERS dictionary in hnet_sim.py)
- Embedding depth = total weight of every link touching the pattern.
- Rate rule = 1 / (1 + 0.1 × depth). Its form is undecided, and it must eventually reduce to the weak-field target dτ/dt ≈ 1 − GM/(rc²).
- Absorber weight = the same function as the rate rule.
- Toy conserved quantity: each photon carries 1 unit of energy.
- Speed of emission effects: 1 link per tick.
- The emitter is blocked from absorbing its own photon.
- Absorption resolves on the first tick any candidate is reached.
- Graph: 60 background nodes with 2 random links each. Patterns A (3 nodes), B (6) and C (10) with internal link chances of 0.5, 0.6 and 0.8, and 1 outside link per pattern node. Link weights range from 0.2 to 1.0.
- Emission chance 0.3. Restructuring changes a link weight by ±0.05. Random seed 1. 2000 ticks.
- Cancellation threshold: not built. An earlier unsaved version reportedly used 0.15, which is arbitrary.

## 8. Still open
**For David to decide:**
1. Does the rate rule cover all participation or only started events? (Section 6.1)
2. Zero-survivor ticks: impossible for genuinely massive patterns, or allowed quiet ticks where local time doesn't advance?
3. What embedding depth physically stands for: mass itself, or a compactness-like M/r quantity?

**Framework gap:** how a photon's absorber gets selected, including the timing (Section 6.2).

## 9. Next steps (suggestions, not decisions)
1. Done: graph, binary, event log, absorber selection.
2. Add cancellation to filtering, with a labeled placeholder threshold.
3. Sweep the threshold and report how survivor statistics change.
4. Implement both zero-survivor options and compare.
5. Test whether decoherence tracks connectivity rather than mass (local meaning only).
6. Later: a connectivity-gradient test for g(r) ∝ 1/r.

## 10. Files in Projects\HNET
- `hnet.txt`: the HNET handoff report, current as of October 6, 2026. It was there before the session and was not changed.
- `hnet_sim.py`: the simulator. Run it with `python hnet_sim.py`.
- `CLAUDE.md`: the simulator spec, rebuilt from David's notes, with the two decisions and their reasons, the open item, the placeholder list and the file list.
- `HNET_simulator_report.md`: this report.

Not saved in the folder: `HNET_framework.md` and `HNET_history.md`. Neither was changed. If the absorber question becomes framework content, that's a core-document change, and the history document would need updating too.

## Appendix: hnet_sim.py (complete, as of run 2)
```python
"""
HNET toy simulator: substrate graph, massless/massive binary, event log,
absorber selection by filtering / weighting / resolution.

This is a stress test of HNET's concepts, not a validation of HNET.
Every number in PLACEHOLDERS below is arbitrary and is not a finding.

What is here:
  - Substrate: nodes joined by weighted links.
  - Massive patterns: persistent groups of linked nodes. Only these have an
    embedding depth.
  - Massless patterns: never stored in the graph. A photon exists only as two
    event records (emission, absorption) in the event log.
  - Emission effects spread through the substrate's links. The absorber is
    NOT chosen at emission; it is chosen when the effects reach candidates
    (David's decision 1).
  - The rate rule applies to absorption too, through the weighting stage
    (David's decision 2).
  - Event log: append-only. A massive pattern's own time is the number of
    events it has taken part in.

Not here yet: the cancellation part of filtering (step 2), the zero-survivor
question, decoherence.

MODELING CONVENIENCE, NOT AN HNET CLAIM: the program runs on one global tick.
HNET has no shared universal moment; the global tick is just how the program
orders work.
"""

import random
from collections import deque

# ---------------------------------------------------------------------------
# PLACEHOLDERS: all arbitrary, chosen by Claude, not by HNET.
# ---------------------------------------------------------------------------
PLACEHOLDERS = {
    "seed": 1,
    "ticks": 2000,
    "background_nodes": 60,          # substrate nodes not in any pattern
    "background_links_per_node": 2,  # random links per background node
    "outside_links_per_pattern_node": 1,
    "link_weight_range": (0.2, 1.0),
    # (name, number of nodes, chance that any two of its nodes are linked)
    "massive_patterns": [
        ("A", 3, 0.5),
        ("B", 6, 0.6),
        ("C", 10, 0.8),
    ],
    # Embedding depth = total weight of every link touching the pattern.
    # Local rate = 1 / (1 + depth_scale * depth).
    # Used two ways: the chance per tick a pattern starts a new event, and
    # (decision 2) a candidate absorber's weight. Both uses are placeholders.
    "depth_scale": 0.1,
    # When a pattern starts an event: chance it is a photon emission
    # (otherwise an internal restructuring).
    "emission_chance": 0.3,
    # How much an internal restructuring changes one link's weight.
    "restructure_step": 0.05,
    # Emission effects cross this many links per tick (connectivity-limited).
    "hops_per_tick": 1,
    # Toy conserved quantity: each photon's energy. Must be absorbed by
    # exactly one pattern.
    "photon_energy": 1.0,
    # Whether the emitting pattern is blocked from absorbing its own photon.
    "block_emitter_as_absorber": True,
}


class Substrate:
    """Nodes joined by weighted links. Links are stored once per pair."""

    def __init__(self):
        self.nodes = set()
        self.links = {}  # frozenset({a, b}) -> weight
        self.adj = {}    # node -> set of linked nodes

    def add_node(self, n):
        self.nodes.add(n)
        self.adj.setdefault(n, set())

    def link(self, a, b, w):
        if a != b:
            self.links[frozenset((a, b))] = w
            self.adj[a].add(b)
            self.adj[b].add(a)


class MassivePattern:
    """A persistent group of linked nodes. Only massive patterns live here."""

    def __init__(self, name, nodes):
        self.name = name
        self.nodes = set(nodes)

    def touching_links(self, sub):
        return [p for p in sub.links if p & self.nodes]

    def internal_links(self, sub):
        return [p for p in sub.links if p <= self.nodes]

    def embedding_depth(self, sub):
        # PLACEHOLDER definition.
        return sum(sub.links[p] for p in self.touching_links(sub))


class EventLog:
    """Append-only. Records can be read but never changed or removed."""

    def __init__(self):
        self._records = []

    def append(self, **record):
        record["seq"] = len(self._records)
        self._records.append(dict(record))
        return record["seq"]

    @property
    def records(self):
        return tuple(dict(r) for r in self._records)


def local_rate(p, sub, P):
    # PLACEHOLDER rate function.
    return 1.0 / (1.0 + P["depth_scale"] * p.embedding_depth(sub))


# ---------------------------------------------------------------------------
# The three stages, used here to choose a photon's absorber.
# ---------------------------------------------------------------------------
def filtering(candidates, effect, P):
    """Stage 1. Runs on raw, unweighted candidates.
    Hard blocks:
      - causal order: a pattern the emission's effects have not reached yet
        cannot absorb.
      - (placeholder choice) the emitter cannot absorb its own photon.
    Cancellation among candidates: NOT BUILT YET (step 2). Pass-through.
    """
    survivors = []
    for p in candidates:
        if not (p.nodes & effect["reached"]):
            continue
        if P["block_emitter_as_absorber"] and p.name == effect["from"]:
            continue
        survivors.append(p)
    return survivors


def weighting(survivors, sub, P):
    """Stage 2. Each survivor gets its own probability.
    PLACEHOLDER weight (decision 2): the local rate, so deeper patterns get
    less weight but never zero, and someone always absorbs."""
    weights = [local_rate(p, sub, P) for p in survivors]
    total = sum(weights)
    return [w / total for w in weights]


def resolution(survivors, probs, rng):
    """Stage 3. One weighted survivor becomes the actual event."""
    return rng.choices(survivors, weights=probs, k=1)[0]


def build(P, rng):
    sub = Substrate()
    lo, hi = P["link_weight_range"]
    w = lambda: rng.uniform(lo, hi)

    background = [f"bg{i}" for i in range(P["background_nodes"])]
    for n in background:
        sub.add_node(n)
    for n in background:
        for m in rng.sample(background, P["background_links_per_node"]):
            sub.link(n, m, w())

    patterns = []
    for name, size, density in P["massive_patterns"]:
        nodes = [f"{name}{i}" for i in range(size)]
        for n in nodes:
            sub.add_node(n)
        for i, n in enumerate(nodes):
            for m in nodes[i + 1:]:
                if rng.random() < density:
                    sub.link(n, m, w())
        # keep the group in one piece: chain its nodes together
        for n, m in zip(nodes, nodes[1:]):
            if frozenset((n, m)) not in sub.links:
                sub.link(n, m, w())
        for n in nodes:
            for m in rng.sample(background, P["outside_links_per_pattern_node"]):
                sub.link(n, m, w())
        patterns.append(MassivePattern(name, nodes))
    return sub, patterns


def run(P=PLACEHOLDERS):
    rng = random.Random(P["seed"])
    sub, patterns = build(P, rng)
    log = EventLog()
    own_time = {p.name: 0 for p in patterns}
    start_depth = {p.name: p.embedding_depth(sub) for p in patterns}
    start_rate = {p.name: local_rate(p, sub, P) for p in patterns}
    node_count, start_links = len(sub.nodes), len(sub.links)

    # spreading_effects: the physical effects of each emission event, spreading
    # outward through the substrate's links at a connectivity-limited speed.
    # These are effects of the emission event, NOT photon state. The photon
    # itself maintains nothing between its emission and its absorption, and
    # nothing here records where "the photon" is or who will absorb it.
    spreading_effects = []
    next_photon = 0

    for tick in range(P["ticks"]):  # global tick: modeling convenience only
        # 1. Emission effects spread one step; where they reach candidates,
        #    the three stages choose the absorber.
        still_spreading = []
        for effect in spreading_effects:
            for _ in range(P["hops_per_tick"]):
                new = {m for n in effect["frontier"] for m in sub.adj[n]} - effect["reached"]
                effect["reached"] |= new
                effect["frontier"] = new
            survivors = filtering(patterns, effect, P)
            if not survivors:
                if not effect["frontier"]:
                    effect["stuck"] = True  # reached everything, no absorber
                still_spreading.append(effect)
                continue
            probs = weighting(survivors, sub, P)
            absorber = resolution(survivors, probs, rng)
            log.append(tick=tick, kind="absorption", pattern=absorber.name,
                       photon=effect["photon"], energy=effect["energy"],
                       candidates={p.name: round(q, 3) for p, q in zip(survivors, probs)})
            own_time[absorber.name] += 1
        spreading_effects = still_spreading

        # 2. Each massive pattern may start a new event (rate rule).
        for p in patterns:
            if rng.random() >= local_rate(p, sub, P):
                continue

            if rng.random() < P["emission_chance"]:
                photon = next_photon
                next_photon += 1
                log.append(tick=tick, kind="emission", pattern=p.name,
                           photon=photon, energy=P["photon_energy"])
                spreading_effects.append({
                    "photon": photon, "from": p.name, "energy": P["photon_energy"],
                    "reached": set(p.nodes), "frontier": set(p.nodes),
                })
            else:
                pair = rng.choice(p.internal_links(sub))
                old = sub.links[pair]
                change = rng.choice((-1, 1)) * P["restructure_step"]
                sub.links[pair] = min(1.0, max(0.05, old + change))
                log.append(tick=tick, kind="restructure", pattern=p.name,
                           link=tuple(sorted(pair)), old=old, new=sub.links[pair])
            own_time[p.name] += 1

    return (sub, patterns, log, own_time, start_depth, start_rate,
            node_count, start_links, spreading_effects)


def report():
    P = PLACEHOLDERS
    (sub, patterns, log, own_time, start_depth, start_rate,
     node_count, start_links, spreading_effects) = run(P)
    recs = log.records
    T = P["ticks"]

    print("HNET toy simulator (all numbers come from placeholders)")
    print(f"ticks: {T}   substrate nodes: {len(sub.nodes)}   links: {len(sub.links)}")
    print()

    count = lambda name, kind: sum(1 for r in recs if r["pattern"] == name and r["kind"] == kind)
    print("Massive patterns")
    print(f"{'name':<5}{'depth':>7}{'rate rule':>11}{'started':>9}{'absorbed':>10}"
          f"{'own time':>10}{'own time/tick':>15}")
    for p in patterns:
        started = count(p.name, "restructure") + count(p.name, "emission")
        print(f"{p.name:<5}{start_depth[p.name]:>7.2f}{start_rate[p.name]:>11.3f}"
              f"{started:>9}{count(p.name, 'absorption'):>10}"
              f"{own_time[p.name]:>10}{own_time[p.name] / T:>15.3f}")
    print("  depth and rate rule are at the start of the run")
    print()

    kinds = {}
    for r in recs:
        kinds[r["kind"]] = kinds.get(r["kind"], 0) + 1
    print("Event log:", len(recs), "records", kinds)
    print()

    by_photon = {}
    for r in recs:
        if "photon" in r:
            by_photon.setdefault(r["photon"], []).append(r)
    print("First 5 photons (each exists only as these two records):")
    for ph in sorted(by_photon)[:5]:
        e, *a = by_photon[ph]
        line = f"  photon {ph}: emission at {e['pattern']} (tick {e['tick']})"
        if a:
            line += (f", absorption at {a[0]['pattern']} (tick {a[0]['tick']}), "
                     f"chosen from {a[0]['candidates']}")
        print(line)
    print()

    emitted = sum(r["energy"] for r in recs if r["kind"] == "emission")
    absorbed = sum(r["energy"] for r in recs if r["kind"] == "absorption")
    spreading = sum(e["energy"] for e in spreading_effects)
    checks = {
        "no nodes added or removed during the run": len(sub.nodes) == node_count,
        "no links added or removed during the run": len(sub.links) == start_links,
        "log order never goes back in time": all(a["tick"] <= b["tick"] for a, b in zip(recs, recs[1:])),
        "every photon has one emission and at most one absorption":
            all(v[0]["kind"] == "emission" and len(v) <= 2 and
                all(r["kind"] == "absorption" for r in v[1:]) for v in by_photon.values()),
        "energy: emitted = absorbed + still spreading": abs(emitted - absorbed - spreading) < 1e-9,
        "no emission effects stuck with nobody to absorb":
            not any(e.get("stuck") for e in spreading_effects),
    }
    print("Code consistency checks (not findings):")
    for name, ok in checks.items():
        print(f"  [{'ok' if ok else 'FAIL'}] {name}")
    print(f"  emission effects still spreading when the run stopped: {len(spreading_effects)}")


if __name__ == "__main__":
    report()
```
