/** Time is injected so business rules stay deterministic and testable. */
export interface Clock {
  now(): Date;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

/** Test helper: a clock that only moves when told to. */
export class FixedClock implements Clock {
  private current: Date;

  constructor(initial: Date | string | number) {
    this.current = new Date(initial);
  }

  now(): Date {
    return new Date(this.current);
  }

  set(next: Date | string | number): void {
    this.current = new Date(next);
  }

  advanceMs(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }
}
