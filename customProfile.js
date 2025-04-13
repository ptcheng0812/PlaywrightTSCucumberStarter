const common = {
    require: ["tests/steps/**/*.{js,ts}"],
    requireModule: ["ts-node/register"],
    publishQuiet: true,
};

module.exports = {
    default: {
        ...common,
        paths: ["test/features/**/*.feature"],
    },
    customProfile: {
        ...common,
    },
};
