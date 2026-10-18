import { ArrowDownIcon, ArrowUpIcon } from '../icons';

interface Props {
  name: string;
  onUp?: () => void;
  onDown?: () => void;
}

/** Move up and down without dragging, so reordering never depends on a drag gesture. */
export function MoveButtons({ name, onUp, onDown }: Props) {
  return (
    <>
      <button type="button" className="icon-btn move" onClick={onUp} disabled={!onUp} aria-label={`Move ${name} up`} title="Move up">
        <ArrowUpIcon />
      </button>
      <button type="button" className="icon-btn move" onClick={onDown} disabled={!onDown} aria-label={`Move ${name} down`} title="Move down">
        <ArrowDownIcon />
      </button>
    </>
  );
}
