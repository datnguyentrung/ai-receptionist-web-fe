export const VideoTitleAndDescription = (name: string) => {
  switch (name) {
    case "likesByReactionType":
      return {
        title: "Lượt bày tỏ cảm xúc trọn đời",
        description:
          "Trọn đời: Lượt bày tỏ cảm xúc về thước phim của bạn. Khi nhấn vào nút cảm xúc trên thước phim, mọi người có thể chia sẻ các cảm xúc khác nhau về nội dung của thước phim đó, bao gồm: thích, yêu thích, haha, wow, buồn hoặc phẫn nộ.",
      };
    case "avgTimeWatchedMs":
      return {
        title: "Thời gian xem thước phim trung bình trọn đời",
        description:
          "Trọn đời: thời gian phát thước phim trung bình (tính bằng mili giây), bao gồm mọi khoảng thời gian phát lại thước phim trong một lần phát. Vì tính cả lượt phát lại nên số liệu này có thể cao hơn tổng thời lượng của thước phim",
      };
    case "totalViewTimeMs":
      return {
        title: "Tổng thời gian xem thước phim trọn đời (tính bằng mili giây)",
        description:
          "Trọn đời: Tổng thời gian (tính bằng mili giây) phát thước phim của bạn, bao gồm cả thời gian phát lại.",
      };
    case "shares":
      return {
        title: "Lượt chia sẻ trọn đời",
        description:
          "Trọn đời: Lượt chia sẻ về thước phim của bạn. Khi nhấn vào nút chia sẻ trên thước phim, mọi người có thể chia sẻ nội dung của thước phim đó với bạn bè và người theo dõi.",
      };
    case "comments":
      return {
        title: "Lượt bình luận trọn đời",
        description:
          "Trọn đời: Lượt bình luận về thước phim của bạn. Khi nhấn vào nút bình luận trên thước phim, mọi người có thể chia sẻ ý kiến và phản hồi về nội dung của thước phim đó.",
      };

    case "uniqueReach":
      return {
        title: "Tổng số người tiếp cận thước phim trọn đời",
        description:
          "Trọn đời: Số người đã nhìn thấy thước phim của bạn ít nhất một lần, bất kể thước phim có được phát hay không. Số người tiếp cận khác với lượt hiển thị ở chỗ lượt hiển thị có thể bao gồm nhiều lượt xem thước phim bởi cùng một người",
      };

    case "reelsPlayCount":
      return {
        title: "Lượt phát thước phim trọn đời",
        description:
          "Trọn đời: Số lần thước phim bắt đầu phát sau khi hệ thống đã tính lượt hiển thị. Hệ thống sẽ xác định đây là các phiên phát thước phim có thời lượng phát lại từ 1 mili giây trở lên và không tính lượt phát lại.",
      };

    case "totalPlays":
      return {
        title: "Lượt phát trọn đời",
        description:
          "Số lần thước phim bắt đầu phát sau khi hệ thống đã tính lượt hiển thị. Hệ thống xác định đây là phiên phát thước phim trong tối thiểu 1 mili giây và bao gồm cả lượt phát lại. Lượt phát lại được tính sau lần phát đầu tiên trong cùng một phiên phát thước phim.",
      };

    case "replayCount":
      return {
        title: "Lượt phát lại trọn đời",
        description:
          "Số lần thước phim của bạn bắt đầu phát lại sau lượt phát đầu tiên. Hệ thống xác định đây là những lượt phát lại trong tối thiểu 1 mili giây thuộc cùng một phiên phát thước phim",
      };

    case "retentionGraph":
      return {
        title: "Tỷ lệ giữ chân đối tượng trọn đời",
        description:
          "Trọn đời: Tỷ lệ phần trăm số lần thước phim của bạn được phát ở nhiều phân đoạn mốc thời gian trong tổng số lượt phát. Hầu hết các thước phim sẽ bắt đầu với tỷ lệ giữ chân là 100%, sau đó giảm dần khi lượt phát bắt đầu tụt xuống. Nếu ai đó bỏ qua phần đầu thước phim thì tỷ lệ này sẽ bắt đầu giảm từ mốc thời gian mà thước phim bắt đầu phát.",
      };

    case "newFollowers":
      return {
        title: "Lượt theo dõi trọn đời theo video",
        description:
          "Trọn đời: Số người đã theo dõi Trang hoặc trang cá nhân của bạn trong vòng 24 giờ kể từ khi xem thước phim này. Đây là số liệu ước tính.",
      };
    default:
      return name;
  }
};
