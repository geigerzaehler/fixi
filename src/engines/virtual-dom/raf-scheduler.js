import rafDefault from 'raf'

/**
 * Accepts a function `fn` and returns a `{schedule, cancel}` pair.
 *
 * The `schedule()` function schedules `fn` for invocation with
 * `requestAnimationFrame`. It is ensured that `fn` is only called once before
 * the next animation frame.
 *
 * The `cancel()` function cancels all outstanding `fn` calls.
 */
export default function rafScheduler (fn, raf = rafDefault) {
  let scheduled = false
  let canceled = false

  return {schedule, cancel}

  function schedule () {
    if (scheduled) return

    raf(function () {
      if (canceled) return
      fn()
      scheduled = false
    })
  }

  function cancel () {
    fn = null
    canceled = true
  }
}
