import { EventResponse, formatHomePageEventsData } from "hooks/StrapiAPI";

describe("<HomePage />", () => {
  it("works", () => {
    const expected = [
      {
        id: 1,
        title: "In-Person Youth Crew Q&A Session",
        description: "lorem ipsum",
      },
    ];
    const actual = formatHomePageEventsData({
      data: [
        {
          id: 1,
          attributes: {
            title: "In-Person Youth Crew Q&A Session",
            description: "lorem ipsum",
          } as EventResponse,
        },
      ],
    });
    expect(actual).toEqual(expected);
  });
});
