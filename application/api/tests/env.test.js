describe('Enviroment File test', () => {
    it("checks for sanity", () => {
        expect(true).toBe(true);
    })
    it("checks for NODE_ENV variable", () => {
        expect(process.env.NODE_ENV).toBe("test");
    })
});