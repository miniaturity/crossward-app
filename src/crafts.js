export const CRAFTS = [
    {
        id: 1,
        name: "peanut butter sandwich",
        img: "assets/jovial.png",
        recipe: "peanut butter_bread_bread"
    },
    {
        id: 8,
        name: "potion of vigor",
        img: "assets/jovial.png",
        recipe: "root beer_root beer_root beer_root beer_root beer_root beer_root beer_root beer_root beer_root beer_potion bottle_golden apple"
    },
    {
        id: 9,
        name: "potion of transcendence", // item to be crafted's name
        img: "assets/jovial.png",
        recipe: "enchanted golden apple_enchanted golden apple_enchanted golden apple_potion bottle" //SEPERATE ITEMS BY UNDERSCORE
    }
]

export const CRAFTABLEITEMS = [
    {
        id: 20,
        name: "potion of transcendence",
        img: "assets/jovial.png",
        content: "multAdd-3_livesSet-7777",
        msg: "You feel transcended.",
        desc: "godlike potion (+3 mult, full recovery).",
        cost: null,
        stock: null,
    },
    {
        id: 22,
        name: "peanut butter sandwich",
        img: "assets/jovial.png",
        content: "livesSet-3",
        msg: "Yummers",
        desc: "delicious peanut butter sandwich. (+3 Lives)",
        cost: null,
        stock: null,
    },
    {
        id: 23,
        name: "potion of vigor",
        img: "assets/jovial.png",
        content: "maxLivesSet-5",
        msg: "You feel stronger.",
        desc: "strengthening potion (+5 max lives)",
        cost: null,
        stock: null,
    }
]