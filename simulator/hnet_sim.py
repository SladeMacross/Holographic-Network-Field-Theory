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
