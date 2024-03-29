import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Image from "next/image";
import { db, storage } from "../../../firebase";
import TextareaAutosize from "react-textarea-autosize";
import { SiAiqfome } from "react-icons/si";
import { RiImageAddLine } from "react-icons/ri";

export default function PostEditBox({
  postEditExpand,
  setPostEditExpand,
  postId,
  postText,
  posterEmail,
  session,
}) {
  const [newPostInput, setNewPostInput] = useState(postText);
  const [newImages, setNewImages] = useState([]);
  const [newUrls, setNewUrls] = useState([]);

  // The user can add new images to the existing image array and display them under the post they are trying to edit.
  const handleImagesEdit = (e) => {
    for (let i = 0; i < e.target.files.length; i++) {
      const tempImage = e.target.files[i];
      tempImage["id"] = Math.random();
      if (newImages.length === 0) {
        setNewImages((prevState) => [...prevState, tempImage]);
      } else {
        setNewUrls([]);
        setNewImages((prevState) => [...prevState, tempImage]);
      }
    }
  };

  // uploads the new images to the database
  useEffect(() => {
    if (newImages.length === 0) return;
    const promises = [];
    newImages.map((newImage) => {
      const uploadTask = storage.ref(`images/${newImage.name}`).put(newImage);
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
            .child(newImage.name)
            .getDownloadURL()
            .then((newUrl) => {
              setNewUrls((prevUrls) => [...prevUrls, newUrl]);
            });
        }
      );
    });

    Promise.all(promises)
      .then(() => alert("All images are updated."))
      .catch(() => alert("Images are not successfully updated."));
  }, [newImages]);

  // the user can submit the edited post after finished editing
  const editPost = (e) => {
    e.preventDefault();

    const uploadEditedPost = async () => {
      const postsRef = db.collection("posts");
      const snapshot = await postsRef.doc(postId).get();
      try {
        if (newPostInput !== postText) {
          postsRef.doc(postId).update({ text: newPostInput });
        }
        if (
          snapshot.data().images.sort().join(";") !== newUrls.sort().join(";")
        ) {
          postsRef
            .doc(postId)
            .update({ images: snapshot.data().images.concat(newUrls) });
        }
      } catch {
        alert("Post Update failed.");
      }
    };

    const resetEditedPost = async () => {
      setNewImages([]);
      setNewUrls([]);
      setPostEditExpand("");
    };

    const postEditActions = [uploadEditedPost, resetEditedPost];

    for (const editAction of postEditActions) {
      editAction();
    }
  };

  // the user can delete image from database.
  const handleDeleteImages = async () => {
    const postsRef = db.collection("posts");

    try {
      await postsRef.doc(postId).update({
        images: [],
      });
    } catch {
      alert("images delete failed");
    }
  };

  return (
    <>
      {session && (
        <PostPostingSection
          postEditExpand={postEditExpand}
          userEmail={session.user.email}
          posterEmail={posterEmail}
        >
          <UserIcon>
            <Image
              src={session.user.image}
              alt={"user icon"}
              height={40}
              width={40}
              objectFit="cover"
            />
          </UserIcon>
          <PostWritingForm>
            <PostInputBox
              type="text"
              value={newPostInput}
              maxLength="700"
              onChange={(e) => setNewPostInput(e.target.value)}
            />
            <PostAuthorization>
              <SiAiqfome />
              What would you like to change ?
            </PostAuthorization>
            <PostEditSubmitSection>
              <PostImageSection>
                <UploadImageInput
                  id="editImage"
                  type="file"
                  multiple
                  onChange={(e) => handleImagesEdit(e)}
                />
                <UploadImageLabel htmlFor="editImage">
                  <ImageIconWrapper>
                    <RiImageAddLine />
                  </ImageIconWrapper>
                  Add Images
                </UploadImageLabel>
                <DeleteImageLabel onClick={handleDeleteImages}>
                  Delete Images
                </DeleteImageLabel>
              </PostImageSection>
              <PostSubmitButton
                onClick={(e) => editPost(e)}
                disabled={newUrls.length === newImages.length ? false : true}
              >
                Confirm
              </PostSubmitButton>
            </PostEditSubmitSection>
          </PostWritingForm>
        </PostPostingSection>
      )}
    </>
  );
}

const PostPostingSection = styled.div`
  display: ${({ postEditExpand, userEmail, posterEmail }) =>
    userEmail === posterEmail && postEditExpand ? "flex" : "none"};
  flex-direction: row;
  border: 1px solid rgb(239, 243, 244);
  padding: 10px 18px;
`;

const UserIcon = styled.div`
  display: flex;
  height: 40px;
  width: 40px;
  border-radius: 50px;
  margin-right: 15px;
  overflow: hidden;

  @media screen and (max-width: 700px) {
    display: none;
  }
`;

const PostWritingForm = styled.form``;

const PostInputBox = styled(TextareaAutosize)`
  border: none;
  outline: none;
  height: 45px;
  width: 500px;

  font-size: 18px;
  padding: 4px 1px 7px;

  @media screen and (max-width: 700px) {
    width: 300px;
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

  @media screen and (max-width: 700px) {
    justify-content: flex-start;
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

const DeleteImageLabel = styled.span`
  cursor: pointer;
  @media screen and (max-width: 700px) {
    margin-left: -5px;
    margin-right: 5px;
  }
`;

const PostSubmitButton = styled.button`
  font-size: 15px;
  font-weight: bold;
  border-radius: 50px;
  line-height: 20px;
  padding: 6px 14px;
  color: #fff;
  text-align: center;
  cursor: pointer;
  background-color: rgb(29, 155, 240);
  :disabled {
    background-color: gray;
    cursor: default;
  }
`;
