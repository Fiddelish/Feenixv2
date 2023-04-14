export function FancyPrice({ price, currency }: { price: string; currency?: string }) {
    const [d, c] = price.split(".");
    return (
        <span>
            {d}
            <span className="align-text-top text-xs">.{c}</span> {currency}
        </span>
    );
}
