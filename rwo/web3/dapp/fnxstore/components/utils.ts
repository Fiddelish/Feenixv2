export const truncateAddress = (address: string) => {
    if (!address) return "No Account";
    const match = address.match(
        /^(0x[a-zA-Z0-9]{3})[a-zA-Z0-9]+([a-zA-Z0-9]{3})$/
    );
    if (!match) return address;
    return `${match[1]}…${match[2]}`;
};

export const toHex = (num: number | string) => {
    const val = Number(num);
    return "0x" + val.toString(16);
};
