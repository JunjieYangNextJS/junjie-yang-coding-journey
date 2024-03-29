import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Image from "next/image";
import { timestamp, db, storage } from "../../../firebase";
import { SiAiqfome } from "react-icons/si";
import { RiImageAddLine } from "react-icons/ri";
import TextareaAutosize from "react-textarea-autosize";

export default function PostBox({ session }) {
  const [postInput, setPostInput] = useState("");
  const [images, setImages] = useState([]);
  const [urls, setUrls] = useState([]);

  // the user can select the images they want to upload.
  const handleImagesSelect = (e) => {
    for (let i = 0; i < e.target.files.length; i++) {
      const tempImage = e.target.files[i];
      tempImage["id"] = Math.random();
      if (images.length === 0) {
        setImages((prevState) => [...prevState, tempImage]);
      } else {
        setUrls([]);
        setImages((prevState) => [...prevState, tempImage]);
      }
    }
  };

  // the selected images are uploading and tells the user when it completes.
  useEffect(() => {
    if (images.length === 0) return;
    const promises = [];
    images.map((image) => {
      const uploadTask = storage.ref(`images/${image.name}`).put(image);
      promises.push(uploadTask);
      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.log(error);
        },
        async () => {
          await storage
            .ref("images")
            .child(image.name)
            .getDownloadURL()
            .then((url) => {
              setUrls((prevState) => [...prevState, url]);
            });
        }
      );
    });

    Promise.all(promises)
      .then(() => alert("All images are uploaded."))
      .catch(() => alert("Images are not successfully uploaded."));
  }, [images]);

  // send the post and resets the postbox.
  const sendPost = (e) => {
    e.preventDefault();

    const uploadPost = async () => {
      try {
        db.collection("posts").add({
          posterEmail: session.user.email,
          posterName: session.user.name,
          posterIcon: session.user.image,
          text: postInput,
          images: urls,
          project: 0,
          bookmarked: [],
          commentsAmount: 0,
          liked: [],
          timestamp,
        });
      } catch {
        alert("Post upload failed.");
      }
    };

    const resetPost = async () => {
      setPostInput("");
      setImages([]);
      setUrls([]);
    };

    const postActions = [uploadPost, resetPost];

    for (const action of postActions) {
      action();
    }
  };

  return (
    <>
      {session && (
        <PostPostingSection>
          <UserIcon>
            <ImageWrapper>
              <Image
                src={session.user.image}
                alt={"user icon"}
                height={40}
                width={40}
                objectFit="cover"
              />
            </ImageWrapper>
          </UserIcon>
          <PostWritingForm>
            <PostInputBox
              type="text"
              value={postInput}
              onChange={(e) => setPostInput(e.target.value)}
              placeholder="Share your thoughts..."
              maxLength="700"
            />
            <PostAuthorization>
              <SiAiqfome />
              Feel free to post and comment
            </PostAuthorization>
            <PostEditSubmitSection>
              <PostImageSection>
                <UploadImageInput
                  id="uploadImage"
                  type="file"
                  multiple
                  onChange={(e) => handleImagesSelect(e)}
                />
                <UploadImageLabel htmlFor="uploadImage">
                  <ImageIconWrapper>
                    <RiImageAddLine />
                  </ImageIconWrapper>
                  Images
                </UploadImageLabel>
                <UploadImageInfo images={images} urls={urls}>
                  {images.length}{" "}
                  {images.length === 1 ? "image is " : "images are "}
                  uploading...
                </UploadImageInfo>
              </PostImageSection>
              <PostSubmitButton
                onClick={(e) => sendPost(e)}
                disabled={
                  urls.length === images.length &&
                  (urls.length !== 0 || postInput !== "")
                    ? false
                    : true
                }
              >
                Submit
              </PostSubmitButton>
            </PostEditSubmitSection>
          </PostWritingForm>
        </PostPostingSection>
      )}
    </>
  );
}

const PostPostingSection = styled.div`
  display: flex;
  border: 1px solid rgb(239, 243, 244);
  padding: 10px 18px;
  margin-top: 5px;
  margin-bottom: 20px;
`;

const UserIcon = styled.div`
  display: flex;
  margin-right: 15px;
`;

const ImageWrapper = styled.div`
  height: 40px;
  width: 40px;
  overflow: hidden;
  border-radius: 50px;
`;

const PostWritingForm = styled.form`
  width: max(400px, 100%);
`;

const PostInputBox = styled(TextareaAutosize)`
  border: none;
  outline: none;
  height: 45px;
  width: 500px;
  font-size: 18px;
  padding: 4px 1px 7px;
  @media screen and (max-width: 700px) {
    width: 250px;
  }
`;

const PostAuthorization = styled.div`
  display: flex;
  margin: 5px 0 10px 0;
  color: rgb(29, 155, 240);
  font-weight: 700;
  align-items: center;
  gap: 10px;
`;

const PostEditSubmitSection = styled.div`
  display: flex;
  justify-content: space-between;
  border-top: 1px solid rgb(239, 243, 244);
  padding-top: 11px;
  width: max(400px, 100%);

  @media screen and (max-width: 700px) {
    width: 250px;
    height: 45px;
  }
`;

const PostImageSection = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
`;

const UploadImageInput = styled.input`
  display: none;
`;

const ImageIconWrapper = styled.div`
  font-size: 18px;
  margin-bottom: -5px;
  color: rgb(29, 155, 240);
`;

const UploadImageLabel = styled.label`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 3px;
  cursor: pointer;
`;

const UploadImageInfo = styled.span`
  font-style: italic;
  visibility: ${({ images, urls }) =>
    images.length === urls.length ? "hidden" : "visible"};

  @media screen and (max-width: 700px) {
    font-size: 14px;
    line-height: 13px;
  }
`;

const PostSubmitButton = styled.button`
  font-size: 15px;
  font-weight: bold;
  border-radius: 50px;
  padding: 6px 14px;
  color: #fff;
  text-align: center;
  background-color: rgb(29, 155, 240);
  transition: all 0.3s ease-out;

  :disabled {
    background-color: #f0f1f2;
    color: #919191;
    cursor: default;
  }
`;
